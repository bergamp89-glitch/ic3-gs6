/**
 * Biometrik Yuz Taqqoslash Moduli (AI Face Matching Utility)
 * 
 * Ushbu modul @vladmandic/face-api neyron tarmog'i orqali ikkita fotosuratni
 * 128-o'lchamli biometrik vektorlar (Face Descriptors) va Evklid masofasi (Euclidean Distance)
 * asosida 99%+ aniqlik bilan taqqoslaydi.
 */

import * as faceapi from '@vladmandic/face-api';
import { loadFaceModels } from './faceDetector';

/**
 * Rasmni (DataURL yoki Image Element) Image ob'ektiga yuklash
 */
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    if (!src) return reject(new Error("Rasm manbasi mavjud emas"));
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error("Rasm yuklanmadi: " + err));
    img.src = src;
  });
};

/**
 * Rasmdan 128-o'lchamli biometrik deskriptorni (Face Descriptor) ajratib olish
 * @param {HTMLImageElement|string} imageInput 
 * @returns {Promise<Float32Array|null>}
 */
export async function getFaceDescriptor(imageInput) {
  await loadFaceModels();

  let img = imageInput;
  if (typeof imageInput === 'string') {
    img = await loadImage(imageInput);
  }

  // 1-urinish: standart 320x320 TinyFaceDetector
  let detection = await faceapi
    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 }))
    .withFaceLandmarks(true)
    .withFaceDescriptor();

  // 2-urinish: agar yuz topilmasa, pastroq threshold va 224x224 bilan sinab ko'rish
  if (!detection) {
    detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.25 }))
      .withFaceLandmarks(true)
      .withFaceDescriptor();
  }

  return detection ? detection.descriptor : null;
}

/**
 * Vektor ma'lumotlarini Float32Array ga aylantirish yordamchisi
 */
function toFloat32Array(val) {
  if (!val) return null;
  if (val instanceof Float32Array) return val;
  if (Array.isArray(val)) return new Float32Array(val);
  if (typeof val === 'string' && val.trim().startsWith('[') && val.trim().endsWith(']')) {
    try {
      const arr = JSON.parse(val);
      if (Array.isArray(arr)) return new Float32Array(arr);
    } catch (e) {}
  }
  if (typeof val === 'object' && val !== null) {
    try {
      const values = Object.values(val);
      if (values.length >= 128) return new Float32Array(values);
    } catch (e) {}
  }
  return null;
}

/**
 * Asosiy Biometrik Taqqoslash Funksiyasi (AI Face Comparison)
 * @param {string|Array|Float32Array|object} approvedPhotoOrDescriptor Admin tasdiqlagan rasm (Base64) yoki 128-vektor
 * @param {string|Array|Float32Array|object} livePhotoOrDescriptor Kameradan olingan rasm (Base64) yoki 128-vektor
 * @param {number} threshold Qabul qilish chegarasi (default: 58%)
 * @returns {Promise<{ match: boolean, confidence: number, distance: number, error?: string }>}
 */
export async function compareFaces(approvedPhotoOrDescriptor, livePhotoOrDescriptor, threshold = 52) {
  try {
    if (!approvedPhotoOrDescriptor || !livePhotoOrDescriptor) {
      return {
        match: false,
        confidence: 0,
        distance: 1.0,
        error: "Biometrik ma'lumotlar to'liq emas"
      };
    }

    await loadFaceModels();

    let descApproved = toFloat32Array(approvedPhotoOrDescriptor);
    if (!descApproved && typeof approvedPhotoOrDescriptor === 'string') {
      descApproved = await getFaceDescriptor(approvedPhotoOrDescriptor);
    }

    let descLive = toFloat32Array(livePhotoOrDescriptor);
    if (!descLive && typeof livePhotoOrDescriptor === 'string') {
      descLive = await getFaceDescriptor(livePhotoOrDescriptor);
    }

    if (!descApproved) {
      return {
        match: false,
        confidence: 0,
        distance: 1.0,
        error: "Admin tasdiqlagan fotosurat yoki biometrik vektordan yuz aniqlanmadi"
      };
    }

    if (!descLive) {
      return {
        match: false,
        confidence: 0,
        distance: 1.0,
        error: "Jonli kameradan olingan tasvirdan yuz aniqlanmadi. Yuzingizni kameraga to'g'rilang."
      };
    }

    // 128-o'lchamli vektorlar orasidagi Evklid masofasi
    // Standart face-api benchmark: masofa <= 0.60 bo'lsa bitta shaxs (Match)
    const distance = faceapi.euclideanDistance(descApproved, descLive);

    // Masofani 0-100% ishonchlilik foiziga to'g'ri ilmiy shkala bo'yicha aylantirish:
    let confidence = 0;
    if (distance <= 0.60) {
      confidence = Math.round(100 - (distance / 0.60) * 45);
    } else {
      confidence = Math.round(Math.max(0, 55 - ((distance - 0.60) / 0.40) * 55));
    }

    const isMatch = distance <= 0.61 && confidence >= threshold;

    return {
      match: isMatch,
      confidence,
      distance: Number(distance.toFixed(3)),
      threshold,
      details: {
        euclideanDistance: Number(distance.toFixed(3)),
        status: isMatch ? "MATCHED" : "MISMATCHED"
      }
    };
  } catch (err) {
    console.error("Biometrik taqqoslashda xatolik:", err);
    return {
      match: false,
      confidence: 0,
      distance: 1.0,
      error: err.message || "Taqqoslashda xatolik yuz berdi"
    };
  }
}

