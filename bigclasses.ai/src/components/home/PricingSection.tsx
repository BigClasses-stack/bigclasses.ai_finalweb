
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CheckCircle, X } from "lucide-react";

const pricingPlans = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for beginners to explore AI learning",
    features: [
      { text: "Access to 5 free courses", included: true },
      { text: "Basic AI tutor assistance", included: true },
      { text: "Limited progress tracking", included: true },
      { text: "Community forum access", included: true },
      { text: "Course completion certificates", included: false },
      { text: "Priority support", included: false }
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Pro",
    price: "$29/month",
    description: "Ideal for serious learners and professionals",
    features: [
      { text: "Unlimited access to all courses", included: true },
      { text: "Advanced AI tutoring with personalization", included: true },
      { text: "Comprehensive progress analytics", included: true },
      { text: "1-on-1 virtual lab sessions", included: true },
      { text: "Course completion certificates", included: true },
      { text: "Priority support", included: true }
    ],
    cta: "Start Pro Trial",
    popular: true
  },
  {
    name: "Teams",
    price: "$99/month",
    description: "For organizations and learning groups",
    features: [
      { text: "Everything in Pro plan", included: true },
      { text: "Up to 10 team members", included: true },
      { text: "Team progress dashboard", included: true },
      { text: "Custom learning paths", included: true },
      { text: "Admin controls and analytics", included: true },
      { text: "Dedicated account manager", included: true }
    ],
    cta: "Contact Sales",
    popular: false
  }
];

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/5 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="mb-4">Simple, transparent <span className="gradient-text">pricing</span></h2>
          <p className="text-lg text-gray-600 mb-8">
            Choose the plan that best fits your learning needs.
            All plans include access to our cutting-edge AI learning platform.
          </p>
          
          <div className="inline-flex items-center bg-gray-100 p-1 rounded-full mb-8">
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-primary' : 'text-gray-600'}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${billingCycle === 'annual' ? 'bg-white shadow-sm text-primary' : 'text-gray-600'}`}
              onClick={() => setBillingCycle('annual')}
            >
              Annual <span className="text-green-600 text-xs font-bold">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`border relative group transition-all duration-500 ${
                plan.popular ? 'border-primary shadow-lg hover:shadow-xl' : 'border-gray-200 hover:border-primary/30 hover:shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full shadow-md">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className={`pt-8 pb-4 transition-colors ${plan.popular ? 'bg-gradient-to-br from-primary/5 to-secondary/5' : ''}`}>
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="mb-3">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {billingCycle === 'annual' && plan.price !== "Free" && (
                    <span className="text-sm text-gray-500 ml-1">billed annually</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      {feature.included ? (
                        <CheckCircle className="h-5 w-5 text-success mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-2 pb-8">
                <Button 
                  className={`w-full group transition-all duration-300 ${plan.popular ? 
                    'bg-primary hover:bg-primary/90' : 
                    'bg-gray-800 hover:bg-gray-900'}`} 
                  size="lg"
                >
                  <span className="relative">
                    {plan.cta}
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                  </span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Need a custom solution? <a href="#" className="text-primary hover:underline">Contact our sales team</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
