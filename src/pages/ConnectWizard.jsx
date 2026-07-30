import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Copy, Check } from 'lucide-react';

export default function ConnectWizard({ onShowToast }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [roleArn, setRoleArn] = useState('arn:aws:iam::849201938210:role/CloudLeafAuditRole');
  const [copiedPolicy, setCopiedPolicy] = useState(false);

  const samplePolicy = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:GetMetricData",
        "ce:GetCostAndUsage",
        "ec2:DescribeInstances",
        "rds:DescribeDBInstances",
        "s3:ListAllMyBuckets"
      ],
      "Resource": "*"
    }
  ]
}`;

  const handleCopyPolicy = () => {
    navigator.clipboard.writeText(samplePolicy);
    setCopiedPolicy(true);
    setTimeout(() => setCopiedPolicy(false), 2000);
  };

  const handleFinish = () => {
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'AWS Account Connected',
        message: 'Successfully integrated AWS IAM Role. Beginning CloudWatch telemetry ingestion.',
      });
    }
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {/* Wizard Header */}
      <div className="text-center">
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary tracking-tight flex items-center justify-center gap-2">
          Connect AWS Account
          <Sparkles className="w-6 h-6 text-secondary" />
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant/80 mt-1">
          Provide read-only CloudWatch & Cost Explorer access for AI sustainability auditing.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-between px-6 py-4 glass-panel rounded-2xl border border-outline-variant/15">
        <div className={`flex items-center gap-2 text-xs font-bold ${step >= 1 ? 'text-primary' : 'text-on-surface-variant/50'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${step >= 1 ? 'bg-primary text-on-primary' : 'bg-surface-container-high'}`}>
            1
          </span>
          IAM Policy Setup
        </div>
        <div className="w-12 h-0.5 bg-outline-variant/20" />
        <div className={`flex items-center gap-2 text-xs font-bold ${step >= 2 ? 'text-primary' : 'text-on-surface-variant/50'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${step >= 2 ? 'bg-primary text-on-primary' : 'bg-surface-container-high'}`}>
            2
          </span>
          Role ARN Binding
        </div>
        <div className="w-12 h-0.5 bg-outline-variant/20" />
        <div className={`flex items-center gap-2 text-xs font-bold ${step >= 3 ? 'text-primary' : 'text-on-surface-variant/50'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${step >= 3 ? 'bg-primary text-on-primary' : 'bg-surface-container-high'}`}>
            3
          </span>
          Telemetry Test
        </div>
      </div>

      {/* Step Contents */}
      <div className="glass-card p-8 rounded-3xl border border-outline-variant/15 space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-on-surface">Step 1: Create AWS IAM Read-Only Policy</h3>
            <p className="text-xs text-on-surface-variant/80">
              Copy this least-privilege IAM policy to your AWS Management Console under IAM &gt; Policies.
            </p>

            <div className="relative">
              <pre className="p-4 bg-white rounded-xl border border-outline-variant/20 text-xs text-primary font-mono overflow-x-auto max-h-56">
                {samplePolicy}
              </pre>
              <button
                onClick={handleCopyPolicy}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface border border-outline-variant/20 flex items-center gap-1.5 transition-colors"
              >
                {copiedPolicy ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPolicy ? 'Copied' : 'Copy JSON'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-on-surface">Step 2: Enter Cross-Account Role ARN</h3>
            <p className="text-xs text-on-surface-variant/80">
              Enter the ARN of the IAM role configured with CloudLeaf External ID verification.
            </p>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">AWS Role ARN</label>
              <input
                type="text"
                value={roleArn}
                onChange={(e) => setRoleArn(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm font-mono text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary border border-primary/20 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-on-surface">Telemetry & Guardrails Verified!</h3>
            <p className="text-xs text-on-surface-variant/80 max-w-md mx-auto">
              CloudWatch metrics collector successfully established handshake with <span className="font-mono text-primary">us-east-1</span>.
            </p>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/15">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant/70 hover:text-on-surface disabled:opacity-30 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 hover:bg-primary-container shadow-sm transition-all"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 hover:bg-primary-container shadow-sm transition-all"
            >
              Launch CloudLeaf Dashboard
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
