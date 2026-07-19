import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { examQuestions as q1 } from './src/1-level.js';
import { examQuestions as q2 } from './src/2-level.js';
import { examQuestions as q3 } from './src/3-level.js';

// .env faylidan ma'lumotlarni o'qiymiz
const envPath = path.resolve('.env');
const envConfig = {};
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envConfig[match[1].trim()] = match[2].trim();
    }
  });
}

const supabaseUrl = envConfig['VITE_SUPABASE_URL'];
const supabaseKey = envConfig['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey || supabaseKey.includes('bu_yerga')) {
  console.error("Xatolik: .env faylida VITE_SUPABASE_URL yoki VITE_SUPABASE_ANON_KEY to'g'ri kiritilmagan.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadData() {
  console.log("Savollar Supabase'ga yuklanmoqda...");

  const allQuestions = [];
  
  const formatQuestions = (questions, levelNum) => {
    return questions.map(q => {
      // id, prompt, type larni ajratib, qolgan hamma narsani (options, answersRequired va hk) data ichiga solamiz
      const { id, prompt, type, ...data } = q;
      return {
        id: levelNum * 10000 + parseInt(id), // ID lar takrorlanmasligi uchun (masalan 1-level 1-savol -> 10001)
        level_num: levelNum,
        type: type,
        prompt: prompt,
        data: data
      };
    });
  };

  allQuestions.push(...formatQuestions(q1, 1));
  allQuestions.push(...formatQuestions(q2, 2));
  allQuestions.push(...formatQuestions(q3, 3));

  // Bazaga yuklaymiz
  const { data, error } = await supabase
    .from('questions')
    .upsert(allQuestions); 

  if (error) {
    console.error("Yuklashda xatolik yuz berdi:", error);
  } else {
    console.log(`Muvaffaqiyatli yuklandi! Jami: ${allQuestions.length} ta savol bazaga tushdi.`);
  }
}

uploadData();
