'use client';

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  // Map 0-5 to 0-4
  if (score <= 1) return 1;
  if (score === 2) return 2;
  if (score === 3) return 3;
  return 4;
}

const LEVELS: Record<number, { label: string; color: string }> = {
  0: { label: '', color: 'bg-outline-variant/20' },
  1: { label: 'ضعيفة', color: 'bg-red-500' },
  2: { label: 'متوسطة', color: 'bg-orange-400' },
  3: { label: 'جيدة', color: 'bg-yellow-400' },
  4: { label: 'قوية', color: 'bg-green-500' },
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = password ? getStrength(password) : 0;
  const level = LEVELS[strength];

  if (!password) return null;

  return (
    <div className="flex items-center gap-3 mt-1.5">
      <div className="flex-1 flex gap-1" dir="ltr">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= strength ? level.color : 'bg-outline-variant/20'
            }`}
          />
        ))}
      </div>
      {level.label && (
        <span
          className={`text-[11px] font-bold whitespace-nowrap transition-colors ${
            strength <= 1
              ? 'text-red-500'
              : strength === 2
                ? 'text-orange-500'
                : strength === 3
                  ? 'text-yellow-600'
                  : 'text-green-600'
          }`}
        >
          {level.label}
        </span>
      )}
    </div>
  );
}
