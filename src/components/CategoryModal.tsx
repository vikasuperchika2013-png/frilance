import React, { useState, useEffect } from 'react';
import { Category, TransactionType } from '../types';
import { AVAILABLE_ICONS, CategoryIcon } from './CategoryIcon';
import { X, Check, Sparkles } from 'lucide-react';
import { playSound } from '../services/sound';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id'>) => void;
  initialData?: Category | null;
}

const PRESET_COLORS = [
  '#10b981', '#059669', '#3b82f6', '#2563eb',
  '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
  '#ef4444', '#f59e0b', '#eab308', '#06b6d4',
  '#14b8a6', '#64748b', '#475569', '#0284c7'
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [icon, setIcon] = useState('Utensils');
  const [color, setColor] = useState('#f59e0b');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setType(initialData.type);
        setIcon(initialData.icon);
        setColor(initialData.color);
      } else {
        setName('');
        setType('expense');
        setIcon('Utensils');
        setColor('#f59e0b');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Введите название категории');
      return;
    }

    playSound('success');
    onSave({
      name: name.trim(),
      type,
      icon,
      color,
      isCustom: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        id="category-modal"
        className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: color }}
            >
              <CategoryIcon name={icon} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {initialData ? 'Редактировать категорию' : 'Новая категория'}
              </h3>
              <p className="text-xs text-slate-400">Настройте иконку, цвет и назначение</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Тип категории
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-3 px-4 rounded-2xl font-bold text-sm border transition-all ${
                  type === 'expense'
                    ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                📉 Расход
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-3 px-4 rounded-2xl font-bold text-sm border transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                📈 Доход
              </button>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Название категории
            </label>
            <input
              type="text"
              required
              placeholder="Например: Хобби или Подписки"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Цвет акцента
            </label>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-md' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Выберите иконку
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-44 overflow-y-auto custom-scrollbar p-1">
              {AVAILABLE_ICONS.map((iconKey) => {
                const isSelected = icon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setIcon(iconKey)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/40 scale-105'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <CategoryIcon name={iconKey} className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm transition-all"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Сохранить' : 'Создать'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
