import { useState, useEffect } from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FeaturedArtisans() {
  const navigate = useNavigate();
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/artisans/featured');
        const data = await res.json();
        setArtisans(data.artisans || []);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading || artisans.length === 0) return null;

  return (
    <section className="py-12" style={{ backgroundColor: '#f8fafc' }}>
      <div className="w-full max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold rounded-full"
            style={{ backgroundColor: 'rgba(255, 126, 95, 0.1)', color: '#ff7e5f' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#ff7e5f' }} />
            Excellence
          </div>

          <h2 className="mb-3 text-3xl font-black md:text-4xl" style={{ color: '#2b2d42' }}>
            Artisans
            <span className="text-transparent bg-gradient-to-r from-[#ff7e5f] to-[#ff6b4a] bg-clip-text"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {' '}en vedette
            </span>
          </h2>

          <p className="text-sm text-gray-600">
            Nos meilleurs professionnels certifiés
          </p>
        </div>

        {/* Cards épurées */}
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
          {artisans.map((artisan, index) => {
            const fullName = `${artisan.prenom ?? ''} ${artisan.nom ?? ''}`.trim();
            const initiale = fullName.charAt(0).toUpperCase();

            return (
              <div
                key={artisan.id}
                onClick={() => navigate(`/artisan/${artisan.id}`)}
                className="relative p-5 transition-all duration-300 bg-white border-2 border-gray-100 shadow-sm cursor-pointer rounded-xl hover:shadow-md hover:-translate-y-1 hover:border-gray-200 group"
              >
                {/* Badge TOP */}
                <div className="absolute flex items-center justify-center w-8 h-8 text-xs font-bold text-white rounded-full top-3 right-3"
                  style={{ backgroundColor: '#ff7e5f' }}>
                  {index + 1}
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 overflow-hidden text-lg font-black text-white rounded-full"
                    style={{ background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' }}>
                    {artisan.photo ? (
                      <img src={artisan.photo} alt={fullName} className="object-cover w-full h-full" />
                    ) : (
                      initiale
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate" style={{ color: '#2b2d42' }}>
                      {fullName}
                    </h3>
                    <p className="text-xs text-gray-600 truncate">
                      {artisan.specialite || 'Artisan'}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold" style={{ color: '#2b2d42' }}>
                      {artisan.rating}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    ({artisan.reviews} avis)
                  </span>
                </div>

                {/* Bouton */}
                <button className="flex items-center justify-center w-full gap-2 py-2 text-xs font-bold text-white transition-all rounded-lg hover:shadow-md group-hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #4a6fa5, #3a5784)' }}>
                  Voir le profil
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>

        {/* CTA devenir artisan */}
        <div className="flex items-center justify-between max-w-2xl gap-4 p-5 mx-auto bg-white border-2 border-gray-100 shadow-sm rounded-xl">
          <div>
            <h3 className="mb-1 text-sm font-bold" style={{ color: '#2b2d42' }}>
              Rejoindre notre réseau ?
            </h3>
            <p className="text-xs text-gray-600">Devenez artisan certifié</p>
          </div>
          <button
            onClick={() => navigate('/register?type=artisan')}
            className="px-5 py-2 text-xs font-bold text-white transition-all rounded-lg shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' }}>
            Devenir artisan
          </button>
        </div>
      </div>
    </section>
  );
}