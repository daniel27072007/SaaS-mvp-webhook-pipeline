import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom';
import { redirectToCheckout } from '../services/payments';

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
    if(!plan.planId){
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
        alert('Failed to start payment screen:', error.message)
      }
    }
    //Case 3: user is not loged
    else{
      navigate('/login', { state: { selectedPriceId: plan.priceId } });
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center border-b border-slate-800">
        <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          <Link to="/">
            SaaS MVP
          </Link>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-cyan-400 transition">
            Sign In
          </Link>
          <Link to="/register" className="px-4 py-2 text-sm font-medium bg-cyan-600 hover:bg-cyan-500 rounded-md transition text-slate-950 font-semibold">
            Get Started
          </Link>
        </div>
      </header>

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

        {/* Pricing Cards Grid (Requirement 1 from Image) */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-slate-800/50 p-8 rounded-2xl border transition-all hover:scale-[1.02] ${
                plan.popular ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-slate-700'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-6 bg-cyan-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-slate-400 text-sm mb-6 min-h-[40px]">{plan.description}</p>
              <div className="text-3xl font-extrabold mb-6 text-cyan-400">{plan.price}</div>

              {/* Feature List (Aligned with backend RBAC checks) */}
              <ul className="space-y-3 mb-8 text-sm text-slate-300">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Call to Action Button */}
              <button
                onClick={() => handlePlanSelection(plan)}
                className={`w-full text-center py-3 rounded-xl font-medium transition cursor-pointer ${
                  plan.popular
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-100'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

//this is working great but needs to redirect the client if he have a token directly to the checkout page instead of the register so it can buy the service
//and if the client dont have a token put him at login and then if he dosent have one, then direct to register