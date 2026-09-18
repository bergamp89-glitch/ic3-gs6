/**
 * Real-time AI Face & Quality Detection Utility using @vladmandic/face-api
 * 
 * Haqiqiy Biometrik Face ID talablari:
 * 1. Yuz to'liq oval ramka ichida bo'lishi shart (chekkalari kesilmagan)
 * 2. To'g'riga (kameraga) qaragan bo'lishi shart (burilgan yoki qiya emas)
 * 3. Masofa to'g'ri bo'lishi shart (juda uzoq yoki juda yaqin emas)
 * 4. Kadrda faqat 1 ta inson yuzi bo'lishi shart
 */

import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;
let modelLoadingPromise = null;

/**
 * Neyron tarmoq modellarini bir marta xotiraga yuklash
 */
export async function loadFaceModels() {
  if (modelsLoaded) return true;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = (async () => {
    try {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      modelsLoaded = true;
      return true;
    } catch (err) {
      console.error("Face-API modellarini yuklashda xatolik:", err);
      modelsLoaded = false;
      throw err;
    } finally {
      modelLoadingPromise = null;
    }
  })();

  return modelLoadingPromise;
}

/**
 * Video kadrida yuz borligini va biometrik talablarga to'liq mosligini tekshirish
 * @param {HTMLVideoElement} video 
 * @returns {Promise<{ 
 *   detected: boolean, 
 *   quality: 'good'|'off-center'|'turned'|'tilted'|'too-far'|'too-close'|'multiple'|'low', 
 *   message: string, 
 *   box: object | null
 * }>}
 */
export async function detectFaceInVideo(video) {
  if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
    return {
      detected: false,
      quality: 'low',
      message: "Kamera ulanmoqda...",
      box: null
    };
  }

  // 1. Modellar yuklanganligini ta'minlash
  if (!modelsLoaded) {
    try {
      await loadFaceModels();
    } catch (e) {
      return {
        detected: false,
        quality: 'low',
        message: "AI biometrik modeli yuklanmoqda...",
        box: null
      };
    }
  }

  try {
    const detectorOptions = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.5
    });

    const detections = await faceapi
      .detectAllFaces(video, detectorOptions)
      .withFaceLandmarks(true);

    if (!detections || detections.length === 0) {
      return {
        detected: false,
        quality: 'low',
        message: "Kamera markaziga qarang",
        box: null
      };
    }

    if (detections.length > 1) {
      return {
        detected: false,
        quality: 'multiple',
        message: "Kadrda faqat 1 kishi bo'lishi shart!",
        box: null
      };
    }

    const singleDetection = detections[0];
    const box = singleDetection.detection.box;
    const landmarks = singleDetection.landmarks;

    const vW = video.videoWidth;
    const vH = video.videoHeight;

    // --- 1. OVAL APERTURA CHЕGARALARINI HISOBLASH (UI dagi 270x340 nisbati) ---
    // UI da video `object-cover` bilan 270 / 340 (0.794) nisbatda ko'rsatiladi
    const targetAspect = 270 / 340;
    const videoAspect = vW / vH;

    let visibleW, visibleH, visibleStartX, visibleStartY;
    if (videoAspect > targetAspect) {
      visibleH = vH;
      visibleW = vH * targetAspect;
      visibleStartX = (vW - visibleW) / 2;
      visibleStartY = 0;
    } else {
      visibleW = vW;
      visibleH = vW / targetAspect;
      visibleStartX = 0;
      visibleStartY = (vH - visibleH) / 2;
    }

    const faceLeft = box.x;
    const faceRight = box.x + box.width;
    const faceTop = box.y;
    const faceBottom = box.y + box.height;

    // --- 2. YUZ OVAL ICHIGA TO'LIQ TUSHGANLIGI (CHEKKALARI KESILMAGANLIGI) ---
    const padX = visibleW * 0.04;
    const padY = visibleH * 0.04;

    const isCutOff = (
      faceLeft < (visibleStartX + padX) ||
      faceRight > (visibleStartX + visibleW - padX) ||
      faceTop < (visibleStartY + padY) ||
      faceBottom > (visibleStartY + visibleH - padY)
    );

    if (isCutOff) {
      return {
        detected: false,
        quality: 'off-center',
        message: "Yuzingizni ramka markaziga to'g'rilang",
        box: null
      };
    }

    // --- 3. YUZNING MARKAZDAGI POZITSIYASI ---
    const faceCenterX = faceLeft + box.width / 2;
    const faceCenterY = faceTop + box.height / 2;

    const visibleCenterX = visibleStartX + visibleW / 2;
    const visibleCenterY = visibleStartY + visibleH / 2;

    const offsetXRatio = Math.abs(faceCenterX - visibleCenterX) / visibleW;
    const offsetYRatio = Math.abs(faceCenterY - visibleCenterY) / visibleH;

    if (offsetXRatio > 0.16 || offsetYRatio > 0.18) {
      return {
        detected: false,
        quality: 'off-center',
        message: "Yuzingizni ramka markaziga to'g'rilang",
        box: null
      };
    }

    // --- 4. MASOFA TEKSHIRUVI (O'LCHAM NISBATI) ---
    const faceWidthRatio = box.width / visibleW;

    if (faceWidthRatio < 0.32) {
      return {
        detected: false,
        quality: 'too-far',
        message: "Kameraga yaqinroq keling",
        box: null
      };
    }

    if (faceWidthRatio > 0.78) {
      return {
        detected: false,
        quality: 'too-close',
        message: "Kameradan biroz uzoqlashing",
        box: null
      };
    }

    // --- 5. YUZNING BURILISH BURCHAGI (YAW & ROLL) — HAQIQIY FRONTAL YUZ ---
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const leftEyeCenter = {
      x: (leftEye[0].x + leftEye[3].x) / 2,
      y: (leftEye[0].y + leftEye[3].y) / 2
    };
    const rightEyeCenter = {
      x: (rightEye[0].x + rightEye[3].x) / 2,
      y: (rightEye[0].y + rightEye[3].y) / 2
    };

    // Burun uchi (Landmark 30)
    const noseTip = landmarks.positions[30];

    // Gorizontal simmetriya (boshni yonga burish)
    const distLeftToNose = Math.abs(leftEyeCenter.x - noseTip.x);
    const distRightToNose = Math.abs(rightEyeCenter.x - noseTip.x);
    const symmetryRatio = distLeftToNose / (distRightToNose || 1);

    if (symmetryRatio < 0.52 || symmetryRatio > 1.9) {
      return {
        detected: false,
        quality: 'turned',
        message: "To'g'riga (kameraga) qarang",
        box: null
      };
    }

    // Vertikal bosh qiyaligi (Roll tilt)
    const deltaY = Math.abs(leftEyeCenter.y - rightEyeCenter.y);
    const deltaX = Math.abs(leftEyeCenter.x - rightEyeCenter.x);
    const rollAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    if (rollAngle > 18) {
      return {
        detected: false,
        quality: 'tilted',
        message: "Boshingizni to'g'ri tuting",
        box: null
      };
    }

    // --- 6. KO'Z PIRPIRATISH (EYE ASPECT RATIO - EAR / LIVENESS DETECTION) ---
    const calcEyeEAR = (eye) => {
      if (!eye || eye.length < 6) return 0.3;
      const v1 = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
      const v2 = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
      const h = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
      if (h <= 0) return 0.3;
      return (v1 + v2) / (2.0 * h);
    };

    const leftEAR = calcEyeEAR(leftEye);
    const rightEAR = calcEyeEAR(rightEye);
    const avgEAR = Number(((leftEAR + rightEAR) / 2).toFixed(3));
    const isEyesClosed = avgEAR < 0.21;

    // Barcha biometrik talablar to'liq bajarildi ✓
    return {
      detected: true,
      quality: 'good',
      message: "Yuz to'g'ri joylashdi ✓",
      ear: avgEAR,
      isEyesClosed,
      box: {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
        videoWidth: vW,
        videoHeight: vH
      }
    };
  } catch (err) {
    console.error("Yuzni tahlil qilishda xatolik:", err);
    return {
      detected: false,
      quality: 'low',
      message: "Yuz tahlil qilinmoqda...",
      ear: 0.3,
      isEyesClosed: false,
      box: null
    };
  }
}

