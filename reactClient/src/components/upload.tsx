import React, { useState } from "react";
import axios from "axios";

const Uploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]); 
     }
  };

  const handleUpload = async () => {
    if (!file) return;  

    try {
      // שלב 1: בקשה לשרת לקבלת ה-Presigned URL
      const response = await axios.get("https://localhost:7207/api/upload/presigned-url", {
        params: { fileName: file.name }
      });

      const presignedUrl = response.data.url;

      // שלב 2: העלאת הקובץ ישירות ל-S3 בעזרת ה-Presigned URL
      await axios.put(presignedUrl, file, {
        headers: {
          "Content-Type": file.type,  // סוג הקובץ
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percent);  // הצגת התקדמות העלאה
        },
      });

      alert("הקובץ הועלה בהצלחה!");
    } catch (error) {
      console.error("שגיאה בהעלאה:", error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>העלה קובץ</button>
      {progress > 0 && <div>התקדמות: {progress}%</div>}
    </div>
  );
};

export default Uploader;
