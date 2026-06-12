'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
  optimizedBlob: Blob | null;
  optimizedSize: number | null;
  optimizedUrl: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  width: number | null;
  height: number | null;
  optimizedWidth: number | null;
  optimizedHeight: number | null;
}

interface ImageCompressorProps {
  defaultFormat?: 'image/webp' | 'image/jpeg' | 'image/png';
  defaultQuality?: number;
  defaultMaxWidth?: string;
  targetSizeLabel?: string;
  customHeading?: string;
  customGuide?: string;
}

export default function ImageCompressorClient({
  defaultFormat = 'image/webp',
  defaultQuality = 0.8,
  defaultMaxWidth = 'original',
  targetSizeLabel = '',
  customHeading = '',
  customGuide = '',
}: ImageCompressorProps) {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState<number>(defaultQuality);
  const [maxWidth, setMaxWidth] = useState<string>(defaultMaxWidth);
  const [format, setFormat] = useState<string>(defaultFormat);

  // Sync settings when props change (pSEO navigation)
  useEffect(() => {
    setFormat(defaultFormat);
    setQuality(defaultQuality);
    setMaxWidth(defaultMaxWidth);
  }, [defaultFormat, defaultQuality, defaultMaxWidth]);
  const [isProcessingAll, setIsProcessingAll] = useState<boolean>(false);
  const [activeCompareId, setActiveCompareId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up Object URLs when unmounting
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
        if (file.optimizedUrl) URL.revokeObjectURL(file.optimizedUrl);
      });
    };
  }, []);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleFilesAdded = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: ImageFile[] = [];
    Array.from(fileList).forEach((file) => {
      // 이미지 파일만 필터링
      if (!file.type.startsWith('image/')) return;
      // 30MB 크기 제한
      if (file.size > 30 * 1024 * 1024) {
        alert(`${file.name} 파일은 30MB를 초과하여 제외되었습니다.`);
        return;
      }

      const id = `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const previewUrl = URL.createObjectURL(file);

      // 이미지 해상도 정보 읽기
      const img = new Image();
      img.src = previewUrl;
      img.onload = () => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, width: img.width, height: img.height } : f
          )
        );
      };

      newFiles.push({
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl,
        optimizedBlob: null,
        optimizedSize: null,
        optimizedUrl: null,
        status: 'pending',
        width: null,
        height: null,
        optimizedWidth: null,
        optimizedHeight: null,
      });
    });

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFilesAdded(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesAdded(e.target.files);
  };

  const removeFile = (id: string) => {
    const fileToRemove = files.find((f) => f.id === id);
    if (fileToRemove) {
      if (fileToRemove.previewUrl) URL.revokeObjectURL(fileToRemove.previewUrl);
      if (fileToRemove.optimizedUrl) URL.revokeObjectURL(fileToRemove.optimizedUrl);
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (activeCompareId === id) {
      setActiveCompareId(null);
    }
  };

  const clearAllFiles = () => {
    files.forEach((file) => {
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
      if (file.optimizedUrl) URL.revokeObjectURL(file.optimizedUrl);
    });
    setFiles([]);
    setActiveCompareId(null);
  };

  // Canvas 기반 개별 이미지 압축 로직
  const compressSingleImage = (
    fileObj: ImageFile,
    targetFormat: string,
    qualityVal: number,
    widthLimit: string
  ): Promise<Partial<ImageFile>> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(fileObj.file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const originalWidth = img.width;
          const originalHeight = img.height;

          let targetWidth = originalWidth;
          let targetHeight = originalHeight;

          // 너비 한계가 설정된 경우 리사이징
          if (widthLimit !== 'original') {
            const limit = parseInt(widthLimit, 10);
            if (originalWidth > limit) {
              targetWidth = limit;
              targetHeight = Math.round((originalHeight * limit) / originalWidth);
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ status: 'failed' });
            return;
          }

          // PNG 투명 배경 처리 (JPEG 변환 시 흰색 배경으로 채우기)
          if (targetFormat === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
          }

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve({ status: 'failed' });
                return;
              }

              // 기존에 만들어진 압축 이미지 URL이 있으면 메모리 누수를 방지하기 위해 해제
              if (fileObj.optimizedUrl) {
                URL.revokeObjectURL(fileObj.optimizedUrl);
              }

              resolve({
                status: 'completed',
                optimizedBlob: blob,
                optimizedSize: blob.size,
                optimizedUrl: URL.createObjectURL(blob),
                optimizedWidth: targetWidth,
                optimizedHeight: targetHeight,
              });
            },
            targetFormat,
            targetFormat === 'image/png' ? undefined : qualityVal
          );
        };
        img.onerror = () => {
          resolve({ status: 'failed' });
        };
      };
      reader.onerror = () => {
        resolve({ status: 'failed' });
      };
    });
  };

  // 모든 파일 압축 실행
  const handleCompressAll = async () => {
    if (files.length === 0) return;
    setIsProcessingAll(true);

    // 상태를 먼저 processing으로 세팅
    setFiles((prev) =>
      prev.map((f) => (f.status !== 'completed' ? { ...f, status: 'processing' } : f))
    );

    // 순차적으로 압축 진행
    for (let i = 0; i < files.length; i++) {
      const current = files[i];
      // 이미 성공적으로 압축 완료된 것은 스킵하거나, 설정 변경이 가능하므로 재압축 처리
      setFiles((prev) =>
        prev.map((f) => (f.id === current.id ? { ...f, status: 'processing' } : f))
      );

      const result = await compressSingleImage(current, format, quality, maxWidth);

      setFiles((prev) =>
        prev.map((f) => (f.id === current.id ? { ...f, ...result } : f))
      );
    }

    setIsProcessingAll(false);
  };

  // 특정 개별 이미지 압축 실행
  const handleCompressSingle = async (id: string) => {
    const fileObj = files.find((f) => f.id === id);
    if (!fileObj) return;

    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'processing' } : f))
    );

    const result = await compressSingleImage(fileObj, format, quality, maxWidth);

    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...result } : f))
    );
  };

  // 단일 다운로드
  const downloadSingle = (fileObj: ImageFile) => {
    if (!fileObj.optimizedUrl) return;

    // 원래 이름 구하기 (확장자 제거)
    const baseName = fileObj.name.substring(0, fileObj.name.lastIndexOf('.')) || fileObj.name;
    const extension = format.split('/')[1];
    const newFileName = `${baseName}_optimized.${extension}`;

    const link = document.createElement('a');
    link.href = fileObj.optimizedUrl;
    link.download = newFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 일괄 다운로드
  const downloadAll = () => {
    const completedFiles = files.filter((f) => f.status === 'completed' && f.optimizedUrl);
    if (completedFiles.length === 0) return;

    completedFiles.forEach((fileObj, index) => {
      setTimeout(() => {
        downloadSingle(fileObj);
      }, index * 300); // 크롬 등 브라우저 다중 다운로드 차단 경고 완화를 위해 시간차 다운로드 실행
    });
  };

  // 전후 용량 합산 통계
  const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);
  const totalOptimizedSize = files.reduce(
    (acc, f) => acc + (f.optimizedSize || f.size),
    0
  );
  const hasOptimizedAny = files.some((f) => f.status === 'completed' && f.optimizedSize);
  const averageReduction =
    totalOriginalSize > 0
      ? Math.max(0, ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100)
      : 0;

  const activeCompareFile = files.find((f) => f.id === activeCompareId);

  return (
    <div className="max-w-6xl mx-auto py-4 px-2">
      {/* 타이틀 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            {customHeading || '무료 이미지 용량 줄이기'}
          </span>
        </h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {customGuide || '어떠한 파일도 서버로 전송하지 않습니다. 프로그램 설치와 로그인 없이 웹 브라우저 상에서 대량의 이미지 용량 줄이기, 사진 크기 조정 및 WebP 포맷 변환을 100% 안전하고 즉각적으로 완료하세요.'}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          로컬 보안 압축 동작 중 (서버 연산 없음)
        </div>
      </div>

      {/* 파일 업로드 이전 드롭존 */}
      {files.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 min-h-[350px] ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[0.99]'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-slate-600'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">
            여기에 이미지 파일을 드래그하여 놓거나 클릭하세요
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mt-1">
            PNG, JPG, JPEG, WEBP, GIF 등 지원 (파일당 최대 30MB)
          </p>
        </div>
      ) : (
        /* 파일이 업로드된 상태의 2열 레이아웃 */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* 좌측: 컨트롤 패널 */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 sticky top-20">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-2 pb-2 border-b border-slate-100 dark:border-slate-700">
              🛠️ 압축 옵션 설정
            </h2>
            {targetSizeLabel && (
              <div className="mb-4 px-3 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-150 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5 animate-pulse">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                🎯 최적화 목표: <strong className="underline">{targetSizeLabel}</strong>
              </div>
            )}

            {/* 1. 포맷 변환 */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                출력 이미지 포맷
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'WebP (추천)', val: 'image/webp' },
                  { label: 'JPEG', val: 'image/jpeg' },
                  { label: 'PNG (원본)', val: 'image/png' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setFormat(item.val)}
                    className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${
                      format === item.val
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. 품질 조절 */}
            {format !== 'image/png' && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    품질 (Quality)
                  </label>
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>고압축 (저품질)</span>
                  <span>균형</span>
                  <span>고품질 (저압축)</span>
                </div>
              </div>
            )}

            {/* 3. 크기 조정 (리사이징) */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                최대 가로 너비 (Width)
              </label>
              <select
                value={maxWidth}
                onChange={(e) => setMaxWidth(e.target.value)}
                className="w-full p-2.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="original">원본 가로 크기 유지</option>
                <option value="1920">1920px (FHD 모니터용)</option>
                <option value="1280">1280px (일반 HD 웹용)</option>
                <option value="1000">1000px (블로그 본문 추천)</option>
                <option value="800">800px (작은 기사용)</option>
                <option value="640">640px (모바일 최적화)</option>
              </select>
            </div>

            {/* 버튼 그룹 */}
            <div className="space-y-2.5">
              <button
                onClick={handleCompressAll}
                disabled={isProcessingAll}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {isProcessingAll ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    이미지 압축 중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    압축 실행하기
                  </>
                )}
              </button>

              {hasOptimizedAny && (
                <button
                  onClick={downloadAll}
                  className="w-full py-3 bg-slate-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-650 text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  전체 결과물 다운로드
                </button>
              )}

              <button
                onClick={clearAllFiles}
                className="w-full py-2 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 text-slate-500 dark:text-slate-400 font-semibold rounded-lg text-xs transition-colors border border-slate-200 dark:border-slate-800"
              >
                전체 초기화 (비우기)
              </button>
            </div>
          </div>

          {/* 우측: 파일 리스트 및 현황 */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* 전체 용량 절약 통계 카드 */}
            {hasOptimizedAny && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/50 dark:border-emerald-900/30 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                    🎉 최적화 요약 통계
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    총 {files.length}개 파일 처리 | 평균 압축률 {averageReduction.toFixed(1)}% 달성
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">압축 전</div>
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400 line-through">
                      {formatBytes(totalOriginalSize)}
                    </div>
                  </div>
                  <div className="text-2xl text-emerald-600 dark:text-emerald-400 font-extrabold">➔</div>
                  <div className="text-center">
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-extrabold">압축 후</div>
                    <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatBytes(totalOptimizedSize)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 작은 드롭존 (상단에 항상 띄워 추가 파일 업로드를 도움) */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 text-xs font-bold ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*"
                className="hidden"
              />
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              추가 파일 드래그 또는 파일 선택
            </div>

            {/* 개별 파일 카드 리스트 */}
            <div className="space-y-3">
              {files.map((fileObj) => {
                const isCompleted = fileObj.status === 'completed';
                const isProcessing = fileObj.status === 'processing';
                const isFailed = fileObj.status === 'failed';
                const sizeSaved =
                  isCompleted && fileObj.optimizedSize
                    ? ((fileObj.size - fileObj.optimizedSize) / fileObj.size) * 100
                    : 0;

                return (
                  <div
                    key={fileObj.id}
                    className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-all hover:shadow-sm"
                  >
                    {/* 정보 영역 */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {/* 썸네일 */}
                      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200/50 dark:border-slate-800 flex-shrink-0 relative">
                        <img
                          src={fileObj.previewUrl}
                          alt={fileObj.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* 파일 세부정보 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate mb-1">
                          {fileObj.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                          <span>{formatBytes(fileObj.size)}</span>
                          {fileObj.width && fileObj.height && (
                            <span>
                              ({fileObj.width}x{fileObj.height}px)
                            </span>
                          )}
                          {isCompleted && fileObj.optimizedSize && (
                            <>
                              <span className="text-emerald-500 font-bold">➔</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {formatBytes(fileObj.optimizedSize)}
                              </span>
                              {fileObj.optimizedWidth && fileObj.optimizedHeight && (
                                <span>
                                  ({fileObj.optimizedWidth}x{fileObj.optimizedHeight}px)
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 제어 및 상태 */}
                    <div className="flex items-center gap-3.5 self-end md:self-auto flex-shrink-0">
                      {/* 용량 감소율 배지 */}
                      {isCompleted && sizeSaved > 0 && (
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                          -{sizeSaved.toFixed(0)}%
                        </span>
                      )}

                      {/* 상태 인디케이터 */}
                      {isProcessing && (
                        <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
                          <svg className="animate-spin h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          압축 중
                        </div>
                      )}
                      {isFailed && (
                        <span className="text-xs text-rose-500 font-bold">실패</span>
                      )}
                      {fileObj.status === 'pending' && (
                        <span className="text-xs text-slate-400 font-bold">대기 중</span>
                      )}

                      {/* 액션 버튼 */}
                      <div className="flex items-center gap-2">
                        {isCompleted && fileObj.optimizedUrl && (
                          <>
                            <button
                              onClick={() => setActiveCompareId(fileObj.id)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold rounded-lg text-xs transition-all flex items-center gap-1"
                            >
                              🔍 비교
                            </button>
                            <button
                              onClick={() => downloadSingle(fileObj)}
                              className="px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1"
                            >
                              다운로드
                            </button>
                          </>
                        )}
                        {fileObj.status === 'pending' && (
                          <button
                            onClick={() => handleCompressSingle(fileObj.id)}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all"
                          >
                            압축
                          </button>
                        )}
                        <button
                          onClick={() => removeFile(fileObj.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
                          aria-label="Remove file"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 🔍 화질 분할 비교 모달 (Split Comparison Modal) */}
      {activeCompareId && activeCompareFile && activeCompareFile.optimizedUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
            {/* 모달 헤더 */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  🔍 압축 화질 비교
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-md mt-0.5">
                  {activeCompareFile.name} (원본 {formatBytes(activeCompareFile.size)} ➔ 압축 {formatBytes(activeCompareFile.optimizedSize || 0)})
                </p>
              </div>
              <button
                onClick={() => setActiveCompareId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 본문 (비교 슬라이더) */}
            <div className="p-6 flex-1 overflow-y-auto flex flex-col justify-center">
              <ImageCompareSlider
                original={activeCompareFile.previewUrl}
                optimized={activeCompareFile.optimizedUrl}
              />
              <p className="text-center text-xs text-slate-400 mt-4 leading-normal">
                💡 마우스 커서 또는 손가락을 대고 <strong>좌우로 슬라이딩</strong>하여 디테일 화질의 변화를 정밀 비교해보세요.
              </p>
            </div>

            {/* 모달 푸터 */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 rounded-b-2xl flex justify-between items-center">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                용량이 무려{' '}
                {(((activeCompareFile.size - (activeCompareFile.optimizedSize || 0)) / activeCompareFile.size) * 100).toFixed(0)}
                %나 다이어트 되었습니다!
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveCompareId(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  닫기
                </button>
                <button
                  onClick={() => {
                    downloadSingle(activeCompareFile);
                    setActiveCompareId(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
                >
                  압축 파일 다운로드
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ↕️ 이미지 슬라이더 내부 분리 컴포넌트
function ImageCompareSlider({ original, optimized }: { original: string; optimized: string }) {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let position = (x / rect.width) * 100;
    if (position < 0) position = 0;
    if (position > 100) position = 100;
    setSliderPosition(position);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 마우스가 눌려있을 필요 없이 호버만 해도 부드럽게 움직이게 설정 (UX가 더욱 직관적)
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[320px] md:h-[450px] overflow-hidden select-none cursor-ew-resize rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* 1. 원본 이미지 (전체 영역 백그라운드) */}
      <img
        src={original}
        alt="Original"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
      <div className="absolute top-3 left-3 bg-slate-950/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm z-10">
        원본 (Original)
      </div>

      {/* 2. 압축 이미지 (포그라운드 - clip-path로 슬라이더 위치에 맞춰 마스킹) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        <img
          src={optimized}
          alt="Optimized"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
      </div>
      <div className="absolute top-3 right-3 bg-blue-600/80 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm z-10">
        압축 결과 (Optimized)
      </div>

      {/* 3. 슬라이딩 세로 바 */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.4)] z-20"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* 핸들러 단추 */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white dark:bg-slate-900 border border-blue-500 rounded-full flex items-center justify-center shadow-lg pointer-events-none z-30">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" className="rotate-90 origin-center" />
          </svg>
        </div>
      </div>
    </div>
  );
}
