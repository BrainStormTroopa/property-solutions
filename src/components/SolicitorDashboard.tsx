import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Claim, ClaimDocument } from '../lib/supabase';
import { ShoppingCart, Eye, FileText, Image as ImageIcon, Download, CheckCircle } from 'lucide-react';

export const SolicitorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [availableClaims, setAvailableClaims] = useState<Claim[]>([]);
  const [purchasedClaims, setPurchasedClaims] = useState<any[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [documents, setDocuments] = useState<ClaimDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'purchased'>('marketplace');

  useEffect(() => {
    loadClaims();
  }, [activeTab]);

  useEffect(() => {
    if (selectedClaim) {
      loadDocuments(selectedClaim.id);
    }
  }, [selectedClaim]);

  const loadClaims = async () => {
    try {
      if (activeTab === 'marketplace') {
        const { data, error } = await supabase
          .from('claims')
          .select('*')
          .eq('status', 'validated')
          .order('validated_at', { ascending: false });

        if (error) throw error;
        setAvailableClaims(data || []);
      } else {
        const { data, error } = await supabase
          .from('claim_purchases')
          .select('*, claims(*)')
          .eq('solicitor_id', profile?.id)
          .order('purchased_at', { ascending: false });

        if (error) throw error;
        setPurchasedClaims(data || []);
      }
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (claimId: string) => {
    try {
      const { data, error } = await supabase
        .from('claim_documents')
        .select('*')
        .eq('claim_id', claimId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedClaim) return;

    const price = selectedClaim.estimated_value || 0;
    const confirmed = confirm(
      `Purchase this claim for £${price.toFixed(2)}?\n\nProperty: ${selectedClaim.property_address}`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const { error: purchaseError } = await supabase
        .from('claim_purchases')
        .insert({
          claim_id: selectedClaim.id,
          solicitor_id: profile?.id,
          purchase_price: price,
          payment_status: 'completed',
        });

      if (purchaseError) throw purchaseError;

      const { error: claimError } = await supabase
        .from('claims')
        .update({ status: 'sold' })
        .eq('id', selectedClaim.id);

      if (claimError) throw claimError;

      alert('Claim purchased successfully!');
      setSelectedClaim(null);
      setDocuments([]);
      loadClaims();
    } catch (error: any) {
      alert('Error purchasing claim: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && availableClaims.length === 0 && purchasedClaims.length === 0) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Solicitor Portal</h1>
        <p className="text-gray-600 mt-1">Browse and purchase validated disrepair claims</p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'marketplace'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          Marketplace
        </button>
        <button
          onClick={() => setActiveTab('purchased')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'purchased'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          My Purchases
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {activeTab === 'marketplace'
              ? `Available Claims (${availableClaims.length})`
              : `Purchased Claims (${purchasedClaims.length})`
            }
          </h2>

          {activeTab === 'marketplace' ? (
            <>
              {availableClaims.map((claim) => (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaim(claim)}
                  className={`bg-white rounded-lg shadow-md p-5 cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedClaim?.id === claim.id ? 'ring-2 ring-blue-600' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                        {claim.property_address}
                      </h3>
                      <p className="text-sm text-gray-600">{claim.property_postcode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        £{claim.estimated_value?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-gray-500">asking price</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(claim.severity)}`}>
                      {claim.severity}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      Validated
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-2 mb-3">{claim.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                    <span>Tenant: {claim.tenant_name}</span>
                    <span>Validated {new Date(claim.validated_at || '').toLocaleDateString()}</span>
                  </div>
                </div>
              ))}

              {availableClaims.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No claims available</h3>
                  <p className="text-gray-600">Check back later for new validated claims</p>
                </div>
              )}
            </>
          ) : (
            <>
              {purchasedClaims.map((purchase) => (
                <div
                  key={purchase.id}
                  onClick={() => setSelectedClaim(purchase.claims)}
                  className={`bg-white rounded-lg shadow-md p-5 cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedClaim?.id === purchase.claims.id ? 'ring-2 ring-blue-600' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                        {purchase.claims.property_address}
                      </h3>
                      <p className="text-sm text-gray-600">{purchase.claims.property_postcode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        £{purchase.purchase_price.toFixed(2)}
                      </p>
                      <p className="text-xs text-green-600 font-medium">{purchase.payment_status}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(purchase.claims.severity)}`}>
                      {purchase.claims.severity}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-2 mb-3">{purchase.claims.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                    <span>Tenant: {purchase.claims.tenant_name}</span>
                    <span>Purchased {new Date(purchase.purchased_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}

              {purchasedClaims.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg">
                  <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchases yet</h3>
                  <p className="text-gray-600">Browse the marketplace to purchase your first claim</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {selectedClaim ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Claim Details</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Property Address</label>
                  <p className="text-gray-900 font-medium text-lg">{selectedClaim.property_address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Postcode</label>
                    <p className="text-gray-900">{selectedClaim.property_postcode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Severity</label>
                    <div>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getSeverityColor(selectedClaim.severity)}`}>
                        {selectedClaim.severity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tenant Name</label>
                    <p className="text-gray-900">{selectedClaim.tenant_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tenant Contact</label>
                    <p className="text-gray-900">{selectedClaim.tenant_contact}</p>
                  </div>
                </div>

                {selectedClaim.estimated_value && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Price</label>
                    <p className="text-green-600 font-bold text-3xl">£{selectedClaim.estimated_value.toFixed(2)}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{selectedClaim.description}</p>
                </div>

                {selectedClaim.surveyor_notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Surveyor Notes</label>
                    <p className="text-gray-900 whitespace-pre-wrap bg-blue-50 p-4 rounded-lg border border-blue-200">
                      {selectedClaim.surveyor_notes}
                    </p>
                  </div>
                )}
              </div>

              {documents.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Documents & Photos</h3>
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                          {doc.file_type === 'photo' ? (
                            <ImageIcon className="w-5 h-5 text-blue-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-600" />
                          )}
                          <span className="text-sm font-medium">{doc.file_name}</span>
                        </div>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedClaim.status === 'validated' && activeTab === 'marketplace' && (
                <button
                  onClick={handlePurchase}
                  disabled={loading}
                  className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-6 h-6" />
                  Purchase for £{selectedClaim.estimated_value?.toFixed(2) || '0.00'}
                </button>
              )}

              {selectedClaim.status === 'sold' && (
                <div className="bg-gray-100 text-gray-700 px-6 py-4 rounded-lg font-semibold text-center">
                  Purchased
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p>Select a claim to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
