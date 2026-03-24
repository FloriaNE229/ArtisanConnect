import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Zap, Hammer, Paintbrush, HardHat, Shirt, Scissors, KeyRound } from 'lucide-react';
//import { GiSewingNeedle, GiScissors } from 'react-icons/gi';

const CATEGORIES = [
  { name: 'Plomberie', value: 'Plomberie', icon: Wrench },
  { name: 'Électricité', value: 'Électricité', icon: Zap },
  { name: 'Menuiserie', value: 'Menuiserie', icon: Hammer },
  { name: 'Peinture', value: 'Peinture', icon: Paintbrush },
  { name: 'Maçonnerie', value: 'Maçonnerie', icon: HardHat },
  { name: 'Couture', value: 'Couture', icon: Shirt },
  { name: 'Coiffure', value: 'Coiffure', icon: Scissors },
  { name: 'Mécanique', value: 'Mécanique', icon: KeyRound },
];

export default function CategoriesGrid() {
  const navigate = useNavigate();
  const [counts,  setCounts]  = useState({});
  const [loading, setLoading] = useState(true);

  // ── GET /ateliers → compteurs par domaine ──────────────────
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const BASE  = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const token = localStorage.getItem('token');

        const res  = await fetch(`${BASE}/ateliers?par_page=999`, {
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) return;
        const json = await res.json();
        const list = json.data ?? json ?? [];

        const c = {};
        list.forEach(a => {
          const d = a.domaine;
          if (d) c[d] = (c[d] ?? 0) + 1;
        });
        setCounts(c);
      } catch { /* silencieux — compteurs optionnels */ }
      finally { setLoading(false); }
    };
    fetchCounts();
  }, []);

  return (
    <section className="py-12" style={{ backgroundColor: '#f8fafc' }}>
      <div className="w-full max-w-3xl px-4 mx-auto sm:px-6">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold rounded-full"
            style={{ backgroundColor: 'rgba(74, 111, 165, 0.1)', color: '#4a6fa5' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#4a6fa5' }} />
            Spécialités
          </div>

          <h2 className="mb-3 text-3xl font-black md:text-4xl" style={{ color: '#2b2d42' }}>
            Explorez nos catégories
            <span className="text-transparent bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {' '}d'artisanat
            </span>
          </h2>

          <p className="text-sm text-gray-600">
            Tous les métiers de l'artisanat à votre service
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CATEGORIES.map((category) => {
            const Icon  = category.icon;
            const count = counts[category.value];

            return (
              <button
                key={category.value}
                onClick={() => navigate(`/artisans?category=${encodeURIComponent(category.value)}`)}
                className="flex flex-col items-center gap-2 p-4 transition-all duration-300 bg-white border-2 border-gray-100 shadow-sm cursor-pointer rounded-xl hover:shadow-md hover:-translate-y-1 hover:border-gray-200 group"
              >
                <Icon
                  className="w-8 h-8 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: category.color }}
                  strokeWidth={2}
                />
                <span className="text-xs font-bold text-center" style={{ color: '#2b2d42' }}>
                  {category.name}
                </span>
                {!loading && count != null && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${category.color}18`, color: category.color }}>
                    {count} artisan{count > 1 ? 's' : ''}
                  </span>
                )}
                {loading && (
                  <span className="w-12 h-4 bg-gray-100 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}