import { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  {
    icon: Search,
    number: 1,
    title: 'Recherchez',
    description: "Trouvez l'artisan parfait selon vos besoins",
    color: '#4a6fa5',
  },
  {
    icon: Calendar,
    number: 2,
    title: 'Réservez',
    description: 'Prenez rendez-vous en ligne en quelques clics',
    color: '#ff7e5f',
  },
  {
    icon: Star,
    number: 3,
    title: 'Évaluez',
    description: 'Partagez votre expérience avec la communauté',
    color: '#22c55e',
  },
];

export default function HowItWorks() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev === STEPS.length - 1 ? 0 : prev + 1));
  }, []);

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? STEPS.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [goToNext]);

  return (
    <section className="py-12" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container px-4 mx-auto">

        <div className="mb-10 text-center">
          <h2 className="mb-2 text-2xl font-black md:text-3xl" style={{ color: '#2b2d42' }}>
            Comment{' '}
            <span style={{ color: '#4a6fa5' }}>
              ça marche ?
            </span>
          </h2>
          <p className="text-sm text-gray-600">Trois étapes simples</p>
        </div>

        <div className="relative max-w-2xl mx-auto">

          {/* Flèche gauche */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 z-10 p-2 transition-all duration-300 transform -translate-x-4 -translate-y-1/2 bg-white border rounded-full shadow-sm top-1/2 md:-translate-x-10 hover:bg-gray-50 hover:shadow-md"
            style={{ borderColor: '#e2e8f0' }}
            aria-label="Étape précédente"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          {/* Carousel */}
          <div
            className="p-6 overflow-hidden bg-white border shadow-sm md:p-8 rounded-2xl"
            style={{ borderColor: '#e2e8f0' }}
          >
            <div className="relative min-h-[220px] flex items-center justify-center">
              {STEPS.map((step, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    index === currentIndex
                      ? 'opacity-100 translate-x-0'
                      : index < currentIndex
                      ? 'opacity-0 -translate-x-full'
                      : 'opacity-0 translate-x-full'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                    <div className="relative mb-5">
                      <div
                        className="flex items-center justify-center w-16 h-16 rounded-full shadow-sm"
                        style={{ backgroundColor: step.color }}
                      >
                        <step.icon className="text-white w-7 h-7" strokeWidth={2.4} />
                      </div>

                      <div
                        className="absolute flex items-center justify-center w-6 h-6 text-xs font-bold text-white border-2 rounded-full -top-1 -right-1"
                        style={{ backgroundColor: '#2b2d42', borderColor: '#ffffff' }}
                      >
                        {step.number}
                      </div>
                    </div>

                    <h3
                      className="mb-3 text-xl font-bold md:text-2xl"
                      style={{ color: '#2b2d42' }}
                    >
                      {step.title}
                    </h3>

                    <p className="max-w-md text-sm leading-7 text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {STEPS.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="h-2 transition-all duration-300 rounded-full"
                  style={{
                    width: index === currentIndex ? '24px' : '8px',
                    backgroundColor: index === currentIndex ? step.color : '#cbd5e1',
                  }}
                  aria-label={`Aller à l'étape ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Flèche droite */}
          <button
            onClick={goToNext}
            className="absolute right-0 z-10 p-2 transition-all duration-300 transform translate-x-4 -translate-y-1/2 bg-white border rounded-full shadow-sm top-1/2 md:translate-x-10 hover:bg-gray-50 hover:shadow-md"
            style={{ borderColor: '#e2e8f0' }}
            aria-label="Étape suivante"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* CTA */}
        <div
          className="flex items-center justify-between max-w-xl gap-4 p-4 mx-auto mt-10 bg-white border shadow-sm rounded-2xl"
          style={{ borderColor: '#e2e8f0' }}
        >
          <div>
            <h3 className="text-sm font-bold" style={{ color: '#2b2d42' }}>
              Prêt à commencer ?
            </h3>
            <p className="text-xs text-gray-600">Rejoignez des milliers de clients</p>
          </div>

          <button
            onClick={() => navigate('/artisans')}
            className="px-5 py-2.5 text-xs font-bold text-white transition-all rounded-xl shadow-sm hover:shadow-md whitespace-nowrap"
            style={{ backgroundColor: '#ff7e5f' }}
          >
            Trouver un artisan
          </button>
        </div>
      </div>
    </section>
  );
}
