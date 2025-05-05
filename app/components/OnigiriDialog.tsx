"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Onigiri } from "../models/Onigiri";
import { Rating } from "./Rating";

type OnigiriDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (onigiri: Partial<Onigiri>) => void;
  selectedDate: string;
  onigiri?: Onigiri;
};

export function OnigiriDialog({ isOpen, onClose, onSave, selectedDate, onigiri }: OnigiriDialogProps) {
  const [name, setName] = useState(onigiri?.name || "");
  const [storeName, setStoreName] = useState(onigiri?.storeName || "");
  const [price, setPrice] = useState(onigiri?.price?.toString() || "");
  const [imageUrl, setImageUrl] = useState(onigiri?.imageUrl || "");
  const [eatImageUrl, setEatImageUrl] = useState(onigiri?.eatImageUrl || "");
  const [rating, setRating] = useState(onigiri?.rating || 3);
  const [memo, setMemo] = useState(onigiri?.memo || "");
  const [imagePreview, setImagePreview] = useState<string | null>(imageUrl || null);
  const [eatImagePreview, setEatImagePreview] = useState<string | null>(eatImageUrl || null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>, previewSetter: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setter(result);
        previewSetter(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const updatedOnigiri: Partial<Onigiri> = {
      id: onigiri?.id,
      date: selectedDate,
      name,
      storeName,
      price: parseInt(price, 10),
      imageUrl,
      eatImageUrl,
      rating,
      memo,
    };
    onSave(updatedOnigiri);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{onigiri ? "おにぎりを編集" : "おにぎりを登録"}</DialogTitle>
          <DialogDescription>
            {selectedDate}に食べたおにぎりの情報を入力してください
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full items-center gap-2">
            <label htmlFor="name">おにぎり名</label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid w-full items-center gap-2">
            <label htmlFor="storeName">お店の名前</label>
            <Input
              type="text"
              id="storeName"
              value={storeName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setStoreName(e.target.value)}
              required
            />
          </div>
          <div className="grid w-full items-center gap-2">
            <label htmlFor="price">価格</label>
            <Input
              type="number"
              id="price"
              value={price}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
              required
              min="0"
            />
          </div>
          <div className="grid w-full items-center gap-2">
            <label htmlFor="image">おにぎりの写真</label>
            <Input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleImageChange(e, setImageUrl, setImagePreview)}
            />
            {imagePreview && (
              <div className="mt-2 relative flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="おにぎりのプレビュー"
                  className="object-contain"
                  style={{ maxWidth: '100%', maxHeight: '500px', width: 'auto', height: 'auto' }}
                />
              </div>
            )}
          </div>
          <div className="grid w-full items-center gap-2">
            <label htmlFor="eatImage">食べた時の写真</label>
            <Input
              type="file"
              id="eatImage"
              accept="image/*"
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleImageChange(e, setEatImageUrl, setEatImagePreview)}
            />
            {eatImagePreview && (
              <div className="mt-2 relative flex items-center justify-center">
                <img
                  src={eatImagePreview}
                  alt="食べた時のプレビュー"
                  className="object-contain"
                  style={{ maxWidth: '100%', maxHeight: '500px', width: 'auto', height: 'auto' }}
                />
              </div>
            )}
          </div>
          <div className="grid w-full items-center gap-2">
            <label htmlFor="rating">評価</label>
            <Rating rating={rating} onRatingChange={setRating} />
          </div>
          <div className="grid w-full items-center gap-2">
            <label htmlFor="memo">メモ</label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMemo(e.target.value)}
              placeholder="メモを入力してください"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 