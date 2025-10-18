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
      <div className="min-h-screen bg-rps-light-cream flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-rps-burgundy bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-rps-burgundy" />
            </div>
            <h1 className="text-3xl font-bold text-rps-dark mb-4">
              Claim Submitted Successfully!
            </h1>
            <div className="bg-rps-light-rose border-2 border-rps-burgundy rounded-xl p-6 mb-6">
              <p className="text-sm text-rps-mauve mb-2">Your Reference Number:</p>
              <p className="text-3xl font-bold text-rps-burgundy">{referenceNumber}</p>
            </div>
            <p className="text-lg text-rps-dark mb-6">
              Please keep this reference number safe. You'll need it to track your claim.
            </p>
            <div className="bg-rps-rose bg-opacity-10 border border-rps-rose border-opacity-30 rounded-lg p-4 mb-6">
              <p className="text-sm text-rps-dark">
                <strong>What happens next?</strong>
              </p>
              <ol className="text-left text-sm text-rps-dark mt-3 space-y-2 ml-4 list-decimal">
                <li>A professional surveyor will be assigned to assess your claim</li>
                <li>You'll receive a validation code once the assessment is complete</li>
                <li>Your claim will be made available to solicitors for purchase</li>
                <li>We'll contact you at {formData.submitted_by_email} with updates</li>
              </ol>
            </div>
            <button
              onClick={onBack}
              className="bg-rps-burgundy text-white px-8 py-3 rounded-lg font-semibold hover:bg-rps-burgundy-light transition-colors shadow-md"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rps-cream">
      <nav className="bg-gradient-to-r from-rps-charcoal to-rps-dark-charcoal shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/RPS Logo Final .png"
              alt="Rubeus Property Solutions"
              className="h-14 object-contain"
            />
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:bg-rps-red px-4 py-2 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <img
              src="/RPS Logo Final .png"
              alt="Rubeus Property Solutions"
              className="h-16 object-contain mx-auto mb-6"
            />
            <h2 className="text-3xl font-bold text-rps-charcoal mb-2">Submit a Disrepair Claim</h2>
            <p className="text-rps-medium-gray">
              Fill in the details below to submit your housing disrepair claim. You can save as a draft and return within 24 hours.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6">
            <div className="bg-white border-2 border-rps-light-rose rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-rps-dark mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-rps-burgundy" />
                Property Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-rps-dark mb-1">
                    Property Address *
                  </label>
                  <input
                    type="text"
                    value={formData.property_address}
                    onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
                    className="w-full px-4 py-2 border border-rps-mauve border-opacity-30 rounded-lg focus:ring-2 focus:ring-rps-burgundy focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-rps-dark mb-1">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    value={formData.property_postcode}
                    onChange={(e) => setFormData({ ...formData, property_postcode: e.target.value })}
                    className="w-full px-4 py-2 border border-rps-mauve border-opacity-30 rounded-lg focus:ring-2 focus:ring-rps-burgundy focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-rps-dark mb-1">
                    Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full px-4 py-2 border border-rps-mauve border-opacity-30 rounded-lg focus:ring-2 focus:ring-rps-burgundy focus:border-transparent"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-rps-light-rose rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-rps-dark mb-4">Tenant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-rps-dark mb-1">
                    Tenant Name *
                  </label>
                  <input
                    type="text"
                    value={formData.tenant_name}
                    onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                    className="w-full px-4 py-2 border border-rps-mauve border-opacity-30 rounded-lg focus:ring-2 focus:ring-rps-burgundy focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-rps-dark mb-1">
                    Tenant Contact *
                  </label>
                  <input
                    type="text"
                    value={formData.tenant_contact}
                    onChange={(e) => setFormData({ ...formData, tenant_contact: e.target.value })}
                    className="w-full px-4 py-2 border border-rps-mauve border-opacity-30 rounded-lg focus:ring-2 focus:ring-rps-burgundy focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-rps-light-rose rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-rps-dark mb-4">Your Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-rps-dark mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    value={formData.submitted_by_email}
                    onChange={(e) => setFormData({ ...formData, submitted_by_email: e.target.value })}
                    className="w-full px-4 py-2 border border-rps-mauve border-opacity-30 rounded-lg focus:ring-2 focus:ring-rps-burgundy focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-rps-dark mb-1">
                    Your Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.submitted_by_phone}
                    onChange={(e) => setFormData({ ...formData, submitted_by_phone: e.target.value })}
                    className="w-full px-4 py-2 border border-rps-mauve border-opacity-30 rounded-lg focus:ring-2 focus:ring-rps-burgundy focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description of Disrepair *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                placeholder="Please provide detailed information about the disrepair issues..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Repair Value (£) (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.estimated_value}
                onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Documents (Optional)
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
                  Upload Photos (Optional)
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
                <div className="bg-rps-light-cream rounded-lg p-4 border border-rps-light-rose">
                  <h4 className="font-medium text-rps-dark mb-2">Files to upload:</h4>
                  <div className="space-y-2">
                    {files.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                        <div className="flex items-center gap-2">
                          {item.type === 'photo' ? (
                            <Image className="w-4 h-4 text-rps-burgundy" />
                          ) : (
                            <FileText className="w-4 h-4 text-rps-burgundy" />
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

            <div className="bg-white border-2 border-rps-light-rose rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-rps-dark mb-4">GDPR Consent & Privacy</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.gdpr_consent_given}
                    onChange={(e) => setFormData({ ...formData, gdpr_consent_given: e.target.checked })}
                    className="mt-1 w-5 h-5 text-rps-burgundy border-rps-mauve rounded focus:ring-2 focus:ring-rps-burgundy"
                    required
                  />
                  <span className="text-sm text-rps-dark">
                    <strong>Required:</strong> I consent to Rubeus Property Solutions processing my personal data to handle my disrepair claim. This includes sharing my information with surveyors and solicitors as necessary to process my claim. I understand my data will be stored securely and handled in accordance with GDPR regulations. *
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.gdpr_marketing_consent}
                    onChange={(e) => setFormData({ ...formData, gdpr_marketing_consent: e.target.checked })}
                    className="mt-1 w-5 h-5 text-rps-burgundy border-rps-mauve rounded focus:ring-2 focus:ring-rps-burgundy"
                  />
                  <span className="text-sm text-rps-dark">
                    <strong>Optional:</strong> I would like to receive updates and information about related services from Rubeus Property Solutions.
                  </span>
                </label>

                <p className="text-xs text-rps-mauve mt-4">
                  Your data will be retained for the duration of your claim plus 6 years as required by law. You have the right to access, rectify, or delete your personal data at any time by contacting us at admin@rubeus-solutions.com.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                disabled={loading}
                className="flex-1 bg-rps-burgundy text-white px-6 py-3 rounded-lg font-semibold hover:bg-rps-burgundy-light transition-colors disabled:bg-gray-400 shadow-md"
              >
                {loading ? 'Submitting...' : 'Submit Claim'}
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="flex-1 bg-rps-mauve text-white px-6 py-3 rounded-lg font-semibold hover:bg-rps-rose transition-colors disabled:bg-gray-400"
              >
                Save as Draft (24hrs)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
