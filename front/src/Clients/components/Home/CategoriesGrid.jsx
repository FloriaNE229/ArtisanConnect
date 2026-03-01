import { useNavigate } from "react-router-dom";
import {
  Wrench,
  PlugZap,
  Hammer,
  Paintbrush,
  HardHat,
  KeyRound,
} from "lucide-react";
import { GiSewingNeedle, GiScissors } from "react-icons/gi";

export default function CategoriesGrid() {
  const navigate = useNavigate();

  const categories = [
    {
      name: "Plomberie",
      value: "plomberie",
      color: "#3b82f6",
      icon: Wrench,
    },
    {
      name: "Électricité",
      value: "electricite",
      color: "#eab308",
      icon: PlugZap,
    },
    {
      name: "Menuiserie",
      value: "menuiserie",
      color: "#f97316",
      icon: Hammer,
    },
    {
      name: "Peinture",
      value: "peinture",
      color: "#ec4899",
      icon: Paintbrush,
    },
    {
      name: "Maçonnerie",
      value: "maconnerie",
      color: "#ef4444",
      icon: HardHat,
    },
    {
      name: "Couture",
      value: "couture",
      color: "#a855f7",
      icon: GiSewingNeedle,
    },
    {
      name: "Coiffure",
      value: "coiffure",
      color: "#22c55e",
      icon: GiScissors,
    },
    {
      name: "Mécanique",
      value: "mecanique",
      color: "#6b7280",
      icon: KeyRound,
    },
  ];

  const handleCategoryClick = (category) => {
    navigate(`/artisans?category=${category.value}`);
  };

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

        {/* Grid encore plus étroit */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <button
                key={index}
                onClick={() => handleCategoryClick(category)}
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
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}