import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Claim } from '../lib/supabase';
import { Plus, FileText, Image, Trash2, AlertCircle } from 'lucide-react';

export const OperativeDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    property_address: '',
    property_postcode: '',
    tenant_name: '',
    tenant_contact: '',
    description: '',
    severity: 'medium' as const,
    estimated_value: '',
  });

  const [files, setFiles] = useState<{ file: File; type: 'document' | 'photo' }[]>([]);

  useEffect(() => {
    loadClaims();
  }, [profile]);

  const loadClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('operative_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'photo') => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({ file, type }));
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .insert({
          operative_id: profile?.id,
          property_address: formData.property_address,
          property_postcode: formData.property_postcode,
          tenant_name: formData.tenant_name,
          tenant_contact: formData.tenant_contact,
          description: formData.description,
          severity: formData.severity,
          estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
          is_draft: false,
          gdpr_consent_given: true,
        })
        .select()
        .single();

      if (claimError) throw claimError;

      for (const { file, type } of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${claim.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('claim-files')
          .upload(fileName, file);

        if (uploadError) {
          console.error('File upload error:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('claim-files')
          .getPublicUrl(fileName);

        await supabase.from('claim_documents').insert({
          claim_id: claim.id,
          file_name: file.name,
          file_type: type,
          file_url: publicUrl,
          file_size: file.size,
          uploaded_by: profile?.id,
        });
      }

      setFormData({
        property_address: '',
        property_postcode: '',
        tenant_name: '',
        tenant_contact: '',
        description: '',
        severity: 'medium',
        estimated_value: '',
      });
      setFiles([]);
      setShowForm(false);
      loadClaims();
    } catch (error: any) {
      alert('Error submitting claim: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'validated': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'sold': return 'bg-gray-100 text-gray-800';
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Claims</h1>
          <p className="text-gray-600 mt-1">Submit and track disrepair claims</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Claim
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit New Claim</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Address
                </label>
                <input
                  type="text"
                  value={formData.property_address}
                  onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postcode
                </label>
                <input
                  type="text"
                  value={formData.property_postcode}
                  onChange={(e) => setFormData({ ...formData, property_postcode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tenant Name
                </label>
                <input
                  type="text"
                  value={formData.tenant_name}
                  onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tenant Contact
                </label>
                <input
                  type="text"
                  value={formData.tenant_contact}
                  onChange={(e) => setFormData({ ...formData, tenant_contact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Value (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.estimated_value}
                  onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Documents
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 'document')}
                  multiple
                  accept=".pdf,.doc,.docx"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Photos
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 'photo')}
                  multiple
                  accept="image/*"
                  className="w-full"
                />
              </div>

              {files.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Files to upload:</h4>
                  <div className="space-y-2">
                    {files.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                        <div className="flex items-center gap-2">
                          {item.type === 'photo' ? (
                            <Image className="w-4 h-4 text-blue-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="text-sm">{item.file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Submitting...' : 'Submit Claim'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {claims.map((claim) => (
          <div key={claim.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{claim.property_address}</h3>
                <p className="text-sm text-gray-600">{claim.property_postcode}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(claim.status)}`}>
                {claim.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(claim.severity)}`}>
                  {claim.severity}
                </span>
                {claim.estimated_value && (
                  <span className="text-sm font-medium text-green-600">
                    £{claim.estimated_value.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 line-clamp-3">{claim.description}</p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Submitted {new Date(claim.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {claims.length === 0 && !showForm && (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No claims yet</h3>
          <p className="text-gray-600">Click "New Claim" to submit your first disrepair claim</p>
        </div>
      )}
    </div>
  );
};
