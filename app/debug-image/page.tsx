"use client";

import Image from "next/image";

export default function DebugImage() {
  const imagePaths = [
    { path: "/images/onigiri-sample-1.jpg", desc: "おにぎり画像1" },
    { path: "/images/onigiri-sample-2.jpg", desc: "おにぎり画像2" },
    { path: "/images/onigiri-sample-4.jpg", desc: "おにぎり画像3" },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">画像デバッグページ</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {imagePaths.map((item, index) => (
          <div key={index} className="border p-4 rounded">
            <h2 className="text-lg font-medium mb-2">{item.desc}</h2>
            <p className="text-sm text-gray-500 mb-2">{item.path}</p>
            
            <div className="h-40 bg-gray-100 rounded-md overflow-hidden">
              <Image
                src={item.path}
                alt={`テスト画像 ${index + 1}`}
                width={300}
                height={200}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
            
            <div className="mt-4">
              <p>通常のimg要素:</p>
              <img
                src={item.path}
                alt={`通常のimg要素 ${index + 1}`}
                className="mt-2 h-20 object-cover rounded"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 