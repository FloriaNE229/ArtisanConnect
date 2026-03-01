import { CheckCircle, Shield, Star, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CTASection() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: '0€',
      title: 'Inscription gratuite',
      description: 'Créez votre profil sans frais',
      color: '#4a6fa5'
    },
    {
      icon: Shield,
      title: 'Support 24/7',
      description: 'Assistance disponible',
      color: '#ff7e5f'
    },
    {
      icon: Star,
      title: '+30% clients',
      description: 'Augmentation moyenne',
      color: '#22c55e'
    }
  ];

  const handleCreateWorkshop = () => {
    navigate('/register?type=artisan');
  };

  return (
    <section className="relative py-12 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div className="relative w-full max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold rounded-full" 
            style={{ backgroundColor: 'rgba(255, 126, 95, 0.1)', color: '#ff7e5f' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#ff7e5f' }} />
            Pour les artisans
          </div>

          <h2 className="mb-3 text-3xl font-black leading-tight md:text-4xl" style={{ color: '#2b2d42' }}>
            Développez votre activité avec
            <span className="text-transparent bg-gradient-to-r from-[#ff7e5f] to-[#ff6b4a] bg-clip-text" 
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {' '}ArtisanConnect
            </span>
          </h2>

          <p className="max-w-xl mx-auto mb-6 text-sm text-gray-600">
            Rejoignez notre communauté d'artisans qualifiés et multipliez vos opportunités
          </p>

          <button 
            onClick={handleCreateWorkshop}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white transition-all shadow-lg rounded-xl hover:shadow-xl hover:scale-105 group" 
            style={{ background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' }}>
            Créer mon atelier
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Timeline horizontale */}
        <div className="relative max-w-3xl mx-auto mt-12">
          
          {/* Barre de progression */}
          <div className="absolute left-0 right-0 h-1 transform -translate-y-1/2 top-6"
            style={{ background: 'linear-gradient(90deg, #4a6fa5, #ff7e5f, #22c55e)' }} />

          <div className="grid grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="relative">
                
                {/* Icon cercle */}
                <div className="relative z-10 flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-white border-4 border-white rounded-full shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${benefit.color}, ${benefit.color}dd)` }}>
                  {typeof benefit.icon === 'string' ? (
                    <span className="text-sm font-black text-white">{benefit.icon}</span>
                  ) : (
                    <benefit.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                  )}
                </div>

                {/* Card */}
                <div className="p-4 text-center transition-all duration-300 bg-white shadow-md rounded-xl hover:shadow-lg hover:-translate-y-1">
                  <h3 className="mb-1 text-sm font-bold" style={{ color: '#2b2d42' }}>
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features bas */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-gray-700">
          {[
            { icon: CheckCircle, text: 'Profil professionnel' },
            { icon: Shield, text: 'Satisfait ou remboursé' },
            { icon: Star, text: 'Avis vérifiés' },
            { icon: Users, text: 'Communauté active' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <item.icon className="w-4 h-4" style={{ color: '#ff7e5f' }} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}