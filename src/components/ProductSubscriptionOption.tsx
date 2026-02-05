import React, { useState } from 'react';
import { Check, Zap, Package, Gift, Truck, Shield } from 'lucide-react';

interface SubscriptionOptionProps {
  product: {
    id: string;
    name: string;
    price: number;
    subscriptionEnabled: boolean;
    subscriptionDiscount: number;
  };
  selectedSize: string;
  onPurchaseTypeChange: (type: 'onetime' | 'subscription', billingCycle?: string) => void;
}

export default function ProductSubscriptionOption({
  product,
  selectedSize,
  onPurchaseTypeChange
}: SubscriptionOptionProps) {
  const [purchaseType, setPurchaseType] = useState<'onetime' | 'subscription'>('onetime');
  const [billingCycle, setBillingCycle] = useState<string>('monthly');

  if (!product.subscriptionEnabled) {
    return null;
  }

  const subscriptionPrice = product.price * (1 - product.subscriptionDiscount / 100);
  const savings = product.price - subscriptionPrice;
  const savingsPercent = product.subscriptionDiscount;

  const handleTypeChange = (type: 'onetime' | 'subscription') => {
    setPurchaseType(type);
    onPurchaseTypeChange(type, type === 'subscription' ? billingCycle : undefined);
  };

  const handleCycleChange = (cycle: string) => {
    setBillingCycle(cycle);
    if (purchaseType === 'subscription') {
      onPurchaseTypeChange('subscription', cycle);
    }
  };

  return (
    <div className="border-2 border-purple-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50 mb-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
        <Package size={20} className="text-purple-600" />
        Choose Your Purchase Type
      </h3>

      <div className="space-y-3">
        {/* One-time Purchase */}
        <div
          onClick={() => handleTypeChange('onetime')}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            purchaseType === 'onetime'
              ? 'border-purple-600 bg-white shadow-md'
              : 'border-gray-200 bg-white hover:border-purple-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                purchaseType === 'onetime'
                  ? 'border-purple-600 bg-purple-600'
                  : 'border-gray-300'
              }`}>
                {purchaseType === 'onetime' && <Check size={14} className="text-white" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">One-time Purchase</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Buy now, no commitment</p>
              </div>
            </div>
            
            <div className="text-right ml-4">
              <p className="font-bold text-lg">₹{product.price.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div
          onClick={() => handleTypeChange('subscription')}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all relative overflow-hidden ${
            purchaseType === 'subscription'
              ? 'border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md'
              : 'border-purple-300 bg-gradient-to-r from-purple-50/50 to-pink-50/50 hover:border-purple-400'
          }`}
        >
          {/* Savings Badge */}
          <div className="absolute top-3 right-3">
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Zap size={12} />
              SAVE {savingsPercent}%
            </span>
          </div>

          <div className="flex items-start justify-between pr-24">
            <div className="flex items-start gap-3 flex-1">
              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                purchaseType === 'subscription'
                  ? 'border-purple-600 bg-purple-600'
                  : 'border-purple-400'
              }`}>
                {purchaseType === 'subscription' && <Check size={14} className="text-white" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-purple-900">Subscribe & Save</span>
                </div>
                <p className="text-sm text-purple-700 font-medium mb-3">
                  Delivered automatically - Cancel anytime
                </p>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={14} className="text-green-600 flex-shrink-0" />
                    <span>Free shipping on all deliveries</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={14} className="text-green-600 flex-shrink-0" />
                    <span>Save ₹{savings.toFixed(0)} every delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={14} className="text-green-600 flex-shrink-0" />
                    <span>Pause or cancel anytime, no questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Gift size={14} className="text-green-600 flex-shrink-0" />
                    <span>Exclusive subscriber perks & early access</span>
                  </div>
                </div>

                {purchaseType === 'subscription' && (
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Delivery frequency:</p>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCycleChange('monthly');
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          billingCycle === 'monthly'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-400'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCycleChange('quarterly');
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          billingCycle === 'quarterly'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-400'
                        }`}
                      >
                        Quarterly
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500 line-through">₹{product.price}</p>
              <p className="font-bold text-xl text-purple-600">
                ₹{subscriptionPrice.toFixed(0)}
                <span className="text-sm font-normal text-gray-600">/mo</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-4 pt-4 border-t border-purple-200 grid grid-cols-3 gap-3 text-center">
        <div className="flex flex-col items-center gap-1">
          <Truck size={18} className="text-purple-600" />
          <p className="text-xs text-gray-600">Free Shipping</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Shield size={18} className="text-purple-600" />
          <p className="text-xs text-gray-600">Secure Payment</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Package size={18} className="text-purple-600" />
          <p className="text-xs text-gray-600">Easy Returns</p>
        </div>
      </div>
    </div>
  );
}