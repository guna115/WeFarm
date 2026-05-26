'use client';

interface Category {
  id: string;
  name: string;
  emoji: string;
}

const categories: Category[] = [
  { id: 'all', name: 'All', emoji: '🌿' },
  { id: 'tomato', name: 'Tomato', emoji: '🍅' },
  { id: 'chilli', name: 'Chilli', emoji: '🌶️' },
  { id: 'brinjal', name: 'Brinjal', emoji: '🍆' },
  { id: 'cauliflower', name: 'Cauliflower', emoji: '🥦' },
  { id: 'cabbage', name: 'Cabbage', emoji: '🥬' },
  { id: 'onion', name: 'Onion', emoji: '🧅' },
  { id: 'capsicum', name: 'Capsicum', emoji: '🫑' },
  { id: 'gourd', name: 'Gourd', emoji: '🥒' },
  { id: 'leafy', name: 'Leafy', emoji: '🥗' },
  { id: 'flower', name: 'Flower', emoji: '🌸' },
  { id: 'fruit', name: 'Fruit', emoji: '🍈' },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function CategoryFilter({
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-1">
      {categories.map((cat) => (
        <button
          key={cat.id}
          id={`category-${cat.id}`}
          onClick={() => onSelect(cat.id)}
          className={`category-pill flex-shrink-0 ${
            selected === cat.id ? 'active' : ''
          }`}
        >
          <span className="text-2xl" role="img" aria-label={cat.name}>
            {cat.emoji}
          </span>
          <span
            className={`text-[11px] font-semibold whitespace-nowrap ${
              selected === cat.id
                ? 'text-primary-700'
                : 'text-surface-500'
            }`}
          >
            {cat.name}
          </span>
        </button>
      ))}
    </div>
  );
}

export { categories };
export type { Category };
