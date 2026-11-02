import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom';
import { redirectToCheckout } from '../services/payments';
import AuthHeader from '../components/AuthHeader';

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const plans = [
    {
      name: 'None',
      price: 'Free',
      description: 'Basic access to discover the core system features.',
      features: ['Basic Dashboard view', 'No advanced reports', 'No AI insights'],
      buttonText: 'Get Started',
      priceId: null,
    },
    {
      name: 'Normal',
      price: 'R$50,00/mo',
      description: 'Perfect for professionals who need standard analytics.',
      features: ['Basic Dashboard view', 'Submit Analytics Reports', 'No AI insights'],
      buttonText: 'Subscribe Normal',
      priceId: 'price_1UTPpB1YFbGwh7Z0EL4zrNsN',
      popular: true,
    },
    {
      name: 'Premium',
      price: 'R$100,00/mo',
      description: 'Full power with our AI Advisor guiding your business decisions.',
      features: ['Basic Dashboard view', 'Submit Analytics Reports', 'Exclusive AI Advisor Insights'],
      buttonText: 'Go Premium',
      priceId: 'price_1UTPox1YFbGwh7Z0qaR2IfWB',
    },
  ];

  const handlePlanSelection = async (plan) => {
    //Case 1: free plan
    if(!plan.priceId){
      if(user){
        navigate('/dashboard')
      }
      else{
        navigate('/login')
      }
      return
    }
    //Case 2: user is loged
    if(user){
      try {
        await redirectToCheckout(plan.priceId)
      } catch (error) {
        alert('Failed to start payment screen:' + error.message)
      }
    }
    //Case 3: user is not loged
    else{
      navigate('/login', { state: { selectedPriceId: plan.priceId } });
    }
  }

  // Função auxiliar para calcular dinamicamente o estado e o texto do botão de cada plano
  const getButtonState = (planName) => {
    // Caso A: Usuário não está logado
    if (!user) {
      if (planName === 'None') return { text: 'Get Started', disabled: false };
      if (planName === 'Normal') return { text: 'Subscribe Normal', disabled: false };
      return { text: 'Go Premium', disabled: false };
    }

    const currentSubscription = user.subscription; // 'none', 'normal' ou 'premium'

    // Caso B: Logado sem plano ('none')
    if (currentSubscription === 'none') {
      if (planName === 'None') return { text: 'Current Plan', disabled: true };
      return { text: 'Upgrade', disabled: false };
    }

    // Caso C: Logado no plano 'normal'
    if (currentSubscription === 'normal') {
      if (planName === 'None') return { text: 'Unavailable', disabled: true };
      if (planName === 'Normal') return { text: 'Current Plan', disabled: true };
      return { text: 'Upgrade', disabled: false };
    }

    // Caso D: Logado no plano 'premium'
    if (currentSubscription === 'premium') {
      if (planName === 'Premium') return { text: 'Current Plan', disabled: true };
      return { text: 'Unavailable', disabled: true };
    }

    return { text: 'Select Plan', disabled: false };
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pt-20 relative">
      {/* Top Navbar */}
      <AuthHeader/>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          Manage Your Business with <br />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Intelligence & Efficiency
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12">
          Choose the ideal plan for your needs and unlock advanced reports and automatic workflows driven by artificial intelligence.
        </p>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
          {plans.map((plan) => {
            // Corrigido para passar plan.name em vez de plan.id que não existe no array original
            const { text, disabled } = getButtonState(plan.name);
            return (
              <div
                key={plan.name}
                className={`relative bg-slate-800/50 p-8 rounded-2xl border transition-all hover:scale-[1.02] flex flex-col justify-between ${
                  plan.popular ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-slate-700'
                } ${disabled ? 'opacity-70' : ''}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-6 bg-cyan-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                
                <div>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-6 min-h-[40px]">{plan.description}</p>
                  <div className="text-3xl font-extrabold mb-6 text-cyan-400">{plan.price}</div>

                  {/* Feature List */}
                  <ul className="space-y-3 mb-8 text-sm text-slate-300">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call to Action Button Inteligente */}
                <button
                  onClick={() => handlePlanSelection(plan)}
                  disabled={disabled}
                  className={`w-full text-center py-3 rounded-xl font-medium transition ${
                    disabled
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-100 cursor-pointer'
                  }`}
                >
                  {text}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}