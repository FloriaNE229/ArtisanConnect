import { CheckCircle, Shield, Star, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BENEFITS = [
  {
    icon: CheckCircle,
    title: 'Inscription gratuite',
    description: 'Créez votre profil sans frais',
  },
  {
    icon: Shield,
    title: 'Support 24/7',
    description: 'Assistance disponible',
  },
  {
    icon: Star,
    title: '+30% clients',
    description: 'Augmentation moyenne',
  },
];

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 bg-slate-50">
      <div className="relative w-full max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-5 text-xs font-semibold text-blue-600 border border-blue-100 rounded-full bg-blue-50">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            Pour les artisans
          </div>

          <h2 className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-4xl">
            Développez votre activité avec{' '}
            <span className="text-blue-600">DigitalArt</span>
          </h2>

          <p className="max-w-xl mx-auto text-sm leading-6 mb-7 text-slate-600">
            Rejoignez notre communauté d'artisans qualifiés et multipliez vos opportunités
          </p>

          <button
            onClick={() => navigate('/register?type=artisan')}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white transition-all bg-blue-600 shadow-sm rounded-xl hover:bg-blue-700 hover:shadow-md"
          >
            Créer mon atelier
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline / Benefits */}
        <div className="relative max-w-3xl mx-auto mt-12">
          <div className="absolute left-0 right-0 hidden h-px -translate-y-1/2 md:block top-6 bg-slate-200" />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {BENEFITS.map((benefit, index) => (
              <div key={index} className="relative">
                <div className="relative z-10 flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-white border-2 border-blue-100 rounded-full shadow-sm">
                  <benefit.icon className="w-5 h-5 text-blue-600" strokeWidth={2.3} />
                </div>

                <div className="p-5 text-center transition-all duration-300 bg-white border shadow-sm rounded-2xl border-slate-200 hover:-translate-y-1 hover:shadow-md">
                  <h3 className="mb-1 text-sm font-bold text-slate-900">{benefit.title}</h3>
                  <p className="text-xs leading-5 text-slate-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-slate-700">
          {[
            { icon: CheckCircle, text: 'Profil professionnel' },
            { icon: Shield, text: 'Satisfait ou remboursé' },
            { icon: Star, text: 'Avis vérifiés' },
            { icon: Users, text: 'Communauté active' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <item.icon className="w-4 h-4 #4a6fa5" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
