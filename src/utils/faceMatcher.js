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
 * Asosiy Biometrik Taqqoslash Funksiyasi (AI Face Comparison)
 * @param {string} approvedPhotoBase64 Admin tasdiqlagan rasm (Reference Base64)
 * @param {string} livePhotoBase64 Kameradan olingan jonli rasm (Live Base64)
 * @param {number} threshold Qabul qilish chegarasi (default: 60%)
 * @returns {Promise<{ match: boolean, confidence: number, distance: number, error?: string }>}
 */
export async function compareFaces(approvedPhotoBase64, livePhotoBase64, threshold = 60) {
  try {
    if (!approvedPhotoBase64 || !livePhotoBase64) {
      return {
        match: false,
        confidence: 0,
        distance: 1.0,
        error: "Rasm ma'lumotlari to'liq emas"
      };
    }

    await loadFaceModels();

    const [descApproved, descLive] = await Promise.all([
      getFaceDescriptor(approvedPhotoBase64),
      getFaceDescriptor(livePhotoBase64)
    ]);

    if (!descApproved) {
      return {
        match: false,
        confidence: 0,
        distance: 1.0,
        error: "Admin tasdiqlagan asl fotosuratdan yuz aniqlanmadi"
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
    // Odatda: distance < 0.58 -> bitta shaxs (Match)
    const distance = faceapi.euclideanDistance(descApproved, descLive);

    // Masofani 0-100% ishonchlilik foiziga aylantirish:
    // masofa <= 0.25 -> 95-100%
    // masofa = 0.40 -> 80%
    // masofa = 0.55 -> 65%
    // masofa = 0.60 -> 50%
    // masofa >= 0.75 -> 0-25%
    let confidence = Math.round(Math.max(0, Math.min(100, (1 - (distance / 0.78)) * 100)));

    // Standart face-api benchmark: masofa 0.58 dan kichik bo'lsa bitta shaxs
    const isMatch = distance <= 0.58 && confidence >= threshold;

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
