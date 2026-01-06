'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  discountPercentage?: number;
  inStock?: boolean;
}

export default function ProductGallery({ 
  images, 
  productName, 
  discountPercentage, 
  inStock 
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="space-y-4">
      {/* Ana Görsel */}
      <div 
        className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 cursor-zoom-in"
        onClick={() => setIsZoomed(true)}
      >
        <img
          src={images[selectedImage]}
          alt={productName}
          className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
        />
        {discountPercentage && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            %{discountPercentage} İNDİRİM
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            inStock ? "bg-green-500" : "bg-red-500"
          } text-white`}>
            {inStock ? "Stokta" : "Tükendi"}
          </span>
        </div>
      </div>
      
      {/* Thumbnail Galerisi */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img: string, idx: number) => (
            <button 
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`aspect-square bg-gray-50 rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:border-cyan-400 ${
                idx === selectedImage ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-gray-200'
              }`}
            >
              <img 
                src={img} 
                alt={`${productName} ${idx + 1}`} 
                className="w-full h-full object-contain p-2" 
              />
            </button>
          ))}
        </div>
      )}

      {/* Büyütülmüş Görsel Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            onClick={() => setIsZoomed(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img
              src={images[selectedImage]}
              alt={productName}
              className="w-full h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Önceki/Sonraki Butonları */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Thumbnail'lar (Modal içinde) */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(idx);
                    }}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === selectedImage ? 'border-cyan-500' : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain bg-white/10 p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
