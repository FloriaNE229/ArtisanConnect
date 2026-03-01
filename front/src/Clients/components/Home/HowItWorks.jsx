import { useState, useEffect } from 'react';
import { Search, Calendar, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HowItWorks() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const steps = [
    {
      icon: Search,
      number: 1,
      title: 'Recherchez',
      description: 'Trouvez l\'artisan parfait selon vos besoins',
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
    }
  ];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? steps.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <section className="py-10" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container px-4 mx-auto">
        
        {/* Header compact */}
        <div className="mb-8 text-center">
          <h2 className="mb-1 text-2xl font-black md:text-3xl" style={{ color: '#2b2d42' }}>
            Comment <span className="text-transparent bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text" 
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ça marche ?
            </span>
          </h2>
          <p className="text-xs text-gray-600">Trois étapes simples</p>
        </div>

        <div className="relative max-w-2xl mx-auto">

          {/* Flèche gauche */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 z-10 p-2 transition-all duration-300 transform -translate-x-6 -translate-y-1/2 bg-white rounded-full shadow-md top-1/2 md:-translate-x-12 hover:bg-gray-100 hover:scale-110"
            aria-label="Étape précédente"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          {/* Contenu carousel - TRANSLUCIDE */}
          <div className="p-6 overflow-hidden shadow-lg md:p-8 rounded-xl backdrop-blur-sm" 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
            <div className="relative min-h-[200px] flex items-center justify-center">
              {steps.map((step, index) => (
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
                  <div className="flex flex-col items-center justify-center h-full">
                    
                    {/* Icon + numéro */}
                    <div className="relative mb-4">
                      <div className="flex items-center justify-center w-16 h-16 transition-transform duration-300 rounded-full shadow-lg hover:scale-110"
                        style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)` }}>
                        <step.icon className="text-white w-7 h-7" strokeWidth={2.5} />
                      </div>
                      <div className="absolute flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full -top-1 -right-1"
                        style={{ backgroundColor: '#ff7e5f' }}>
                        {step.number}
                      </div>
                    </div>

                    {/* Titre */}
                    <h3 className="mb-3 text-xl font-bold text-center md:text-2xl" style={{ color: '#2b2d42' }}>
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="max-w-md text-sm leading-relaxed text-center text-gray-700">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination dots */}
            <div className="flex justify-center gap-2 mt-6">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-gray-900 w-6'
                      : 'bg-gray-300 hover:bg-gray-400 w-2'
                  }`}
                  aria-label={`Aller à l'étape ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Flèche droite */}
          <button
            onClick={goToNext}
            className="absolute right-0 z-10 p-2 transition-all duration-300 transform translate-x-6 -translate-y-1/2 bg-white rounded-full shadow-md top-1/2 md:translate-x-12 hover:bg-gray-100 hover:scale-110"
            aria-label="Étape suivante"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* CTA compact */}
        <div className="flex items-center justify-between max-w-xl gap-3 p-4 mx-auto mt-8 bg-white shadow-md rounded-xl">
          <div>
            <h3 className="text-sm font-bold" style={{ color: '#2b2d42' }}>Prêt à commencer ?</h3>
            <p className="text-xs text-gray-600">Rejoignez des milliers de clients</p>
          </div>
          <button 
            onClick={() => navigate('/artisans')}
            className="px-5 py-2 text-xs font-bold text-white transition-all rounded-lg shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap" 
            style={{ background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' }}>
            Trouver un artisan
          </button>
        </div>
      </div>
    </section>
  );
}