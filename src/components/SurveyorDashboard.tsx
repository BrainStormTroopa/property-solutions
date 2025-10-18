import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Claim, ClaimDocument } from '../lib/supabase';
import { CheckCircle, XCircle, Eye, FileText, Image as ImageIcon, Download } from 'lucide-react';

export const SurveyorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [documents, setDocuments] = useState<ClaimDocument[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'under_review'>('all');

  useEffect(() => {
    loadClaims();
  }, [filter]);

  useEffect(() => {
    if (selectedClaim) {
      loadDocuments(selectedClaim.id);
      setNotes(selectedClaim.surveyor_notes || '');
    }
  }, [selectedClaim]);

  const loadClaims = async () => {
    try {
      let query = supabase
        .from('claims')
        .select('*')
        .in('status', ['pending', 'under_review'])
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setClaims(data || []);
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

  const handleValidate = async (status: 'validated' | 'rejected') => {
    if (!selectedClaim) return;

    setLoading(true);
    try {
      const updateData: any = {
        status,
        surveyor_id: profile?.id,
        surveyor_notes: notes,
        validated_at: new Date().toISOString(),
        is_draft: false,
      };

      if (status === 'validated') {
        const { data: validationCodeData } = await supabase.rpc('generate_validation_code');
        updateData.validation_code = validationCodeData;
      }

      const { error } = await supabase
        .from('claims')
        .update(updateData)
        .eq('id', selectedClaim.id);

      if (error) throw error;

      if (status === 'validated') {
        alert(`Claim validated! Validation Code: ${updateData.validation_code}\nPlease provide this code to the claimant.`);
      }

      setSelectedClaim(null);
      setDocuments([]);
      setNotes('');
      loadClaims();
    } catch (error: any) {
      alert('Error updating claim: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToSelf = async () => {
    if (!selectedClaim) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('claims')
        .update({
          status: 'under_review',
          surveyor_id: profile?.id,
        })
        .eq('id', selectedClaim.id);

      if (error) throw error;

      loadClaims();
      setSelectedClaim({ ...selectedClaim, status: 'under_review', surveyor_id: profile?.id || null });
    } catch (error: any) {
      alert('Error assigning claim: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (loading && claims.length === 0) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Surveyor Dashboard</h1>
        <p className="text-gray-600 mt-1">Review and validate disrepair claims</p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Claims
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('under_review')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'under_review'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Under Review
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Claims ({claims.length})</h2>
          {claims.map((claim) => (
            <div
              key={claim.id}
              onClick={() => setSelectedClaim(claim)}
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                selectedClaim?.id === claim.id ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{claim.property_address}</h3>
                  <p className="text-sm text-gray-600">{claim.property_postcode}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(claim.status)}`}>
                  {claim.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(claim.severity)}`}>
                  {claim.severity}
                </span>
                {claim.estimated_value && (
                  <span className="text-sm font-medium text-green-600">
                    £{claim.estimated_value.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-700 line-clamp-2 mb-2">{claim.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Tenant: {claim.tenant_name}</span>
                <span>{new Date(claim.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}

          {claims.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No claims to review</h3>
              <p className="text-gray-600">All claims have been processed</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {selectedClaim ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Claim Details</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Property Address</label>
                  <p className="text-gray-900">{selectedClaim.property_address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Postcode</label>
                    <p className="text-gray-900">{selectedClaim.property_postcode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Severity</label>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getSeverityColor(selectedClaim.severity)}`}>
                      {selectedClaim.severity}
                    </span>
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
                  <div>
                    <label className="text-sm font-medium text-gray-700">Estimated Value</label>
                    <p className="text-green-600 font-semibold">£{selectedClaim.estimated_value.toFixed(2)}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedClaim.description}</p>
                </div>
              </div>

              {documents.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Documents & Photos</h3>
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
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
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surveyor Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Add your validation notes..."
                />
              </div>

              <div className="flex gap-3">
                {selectedClaim.status === 'pending' && (
                  <button
                    onClick={handleAssignToSelf}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    Assign to Me
                  </button>
                )}

                {selectedClaim.status === 'under_review' && selectedClaim.surveyor_id === profile?.id && (
                  <>
                    <button
                      onClick={() => handleValidate('validated')}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Validate
                    </button>
                    <button
                      onClick={() => handleValidate('rejected')}
                      disabled={loading}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </>
                )}
              </div>
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
