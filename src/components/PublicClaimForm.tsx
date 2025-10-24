import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle, FileText, Image, Trash2, AlertCircle } from 'lucide-react';

interface PublicClaimFormProps {
  onBack: () => void;
}

export const PublicClaimForm: React.FC<PublicClaimFormProps> = ({ onBack }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    property_address: '',
    property_postcode: '',
    tenant_name: '',
    tenant_contact: '',
    submitted_by_email: '',
    submitted_by_phone: '',
    description: '',
    severity: 'medium' as const,
    estimated_value: '',
    gdpr_consent_given: false,
    gdpr_marketing_consent: false,
  });

  const [files, setFiles] = useState<{ file: File; type: 'document' | 'photo' }[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'photo') => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({ file, type }));
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean) => {
    e.preventDefault();
    setError('');

    if (!formData.gdpr_consent_given) {
      setError('You must provide consent to process your data');
      return;
    }

    setLoading(true);

    try {
      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .insert({
          property_address: formData.property_address,
          property_postcode: formData.property_postcode,
          tenant_name: formData.tenant_name,
          tenant_contact: formData.tenant_contact,
          submitted_by_email: formData.submitted_by_email,
          submitted_by_phone: formData.submitted_by_phone,
          description: formData.description,
          severity: formData.severity,
          estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
          gdpr_consent_given: formData.gdpr_consent_given,
          gdpr_marketing_consent: formData.gdpr_marketing_consent,
          is_draft: saveAsDraft,
          status: saveAsDraft ? 'pending' : 'pending',
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
        });
      }

      setReferenceNumber(claim.reference_number);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your claim');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Claim Submitted Successfully!
            </h1>

            <div className="bg-blue-50 border-2 border-blue-600 rounded-xl p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Your Reference Number:</p>
              <p className="text-3xl font-bold text-blue-600">{referenceNumber}</p>
            </div>

            <p className="text-lg text-gray-700 mb-6">
              Please keep this reference number safe. You'll need it to track your claim.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 w-full">
              <p className="text-sm text-gray-900 font-semibold mb-3">
                What happens next?
              </p>
              <ol className="text-left text-sm text-gray-700 space-y-2 ml-4 list-decimal">
                <li>A professional surveyor will be assigned to assess your claim</li>
                <li>You'll receive a validation code once the assessment is complete</li>
                <li>Your claim will be made available to solicitors for purchase</li>
                <li>We'll contact you at {formData.submitted_by_email} with updates</li>
              </ol>
            </div>

            <button
              onClick={onBack}
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            Rubeus Property Solutions
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:bg-red-600 px-4 py-2 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Submit a Disrepair Claim
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Fill in the details below to submit your housing disrepair claim. You can save as a draft and return within 24 hours.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Property Details */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.property_address}
                    onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Enter full property address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.property_postcode}
                    onChange={(e) => setFormData({ ...formData, property_postcode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Enter postcode"
                  />
                </div>
              </div>
            </div>

            {/* Tenant Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tenant Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tenant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tenant_name}
                    onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Enter tenant's full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tenant Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.tenant_contact}
                    onChange={(e) => setFormData({ ...formData, tenant_contact: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Enter contact number"
                  />
                </div>
              </div>
            </div>

            {/* Submitted By */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Contact Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.submitted_by_email}
                    onChange={(e) => setFormData({ ...formData, submitted_by_email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.submitted_by_phone}
                    onChange={(e) => setFormData({ ...formData, submitted_by_phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Claim Details */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Claim Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description of Disrepair *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Describe the disrepair issues in detail..."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity *
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Claim Value (£)
                    </label>
                    <input
                      type="number"
                      value={formData.estimated_value}
                      onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="Optional"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Supporting Documents</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Upload Documents
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'document')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX files</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Image className="w-4 h-4 inline mr-2" />
                    Upload Photos
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'photo')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, HEIC files</p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.type === 'document' ? (
                          <FileText className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Image className="w-5 h-5 text-green-600" />
                        )}
                        <span className="text-sm text-gray-700">{item.file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(item.file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GDPR Consent */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Protection</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.gdpr_consent_given}
                    onChange={(e) => setFormData({ ...formData, gdpr_consent_given: e.target.checked })}
                    className="mt-1 w-4 h-4 text-red-600 rounded focus:ring-red-600"
                  />
                  <span className="text-sm text-gray-700">
                    I consent to Rubeus Property Solutions processing my personal data to handle this claim. *
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.gdpr_marketing_consent}
                    onChange={(e) => setFormData({ ...formData, gdpr_marketing_consent: e.target.checked })}
                    className="mt-1 w-4 h-4 text-red-600 rounded focus:ring-red-600"
                  />
                  <span className="text-sm text-gray-700">
                    I consent to receiving marketing communications from Rubeus Property Solutions.
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={(e) => handleSubmit(e, false)}
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                {loading ? 'Submitting...' : 'Submit Claim'}
              </button>
              <button
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};