import logoEXE from '../assets/LogoEXE.png'

type LogoProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeStyles = {
    sm: { logoHeight: '32px', fontSize: '10px', exeSize: '8px' },
    md: { logoHeight: '48px', fontSize: '14px', exeSize: '12px' },
    lg: { logoHeight: '64px', fontSize: '18px', exeSize: '14px' }
  }

  const styles = sizeStyles[size]

  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <img
        src={logoEXE}
        alt="EXE Logo"
        style={{ height: styles.logoHeight }}
        className="object-contain"
      />
      <div className="flex flex-col">
        <span
          style={{ fontSize: styles.fontSize }}
          className="font-bold leading-tight text-white"
        >
        </span>
        <span
          style={{ fontSize: styles.exeSize }}
          className="font-semibold leading-tight text-white"
        >
        </span>
      </div>
    </div>
  )
}
