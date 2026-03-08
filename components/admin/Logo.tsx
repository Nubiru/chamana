import React from 'react'

const Logo: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1.5rem 0',
    }}>
      <span style={{
        fontFamily: 'serif',
        fontSize: '1.5rem',
        fontWeight: 300,
        letterSpacing: '0.3em',
        color: '#EFEFE9',
      }}>
        CHAMANA
      </span>
      <span style={{
        fontSize: '0.6rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: '#959D90',
        marginTop: '0.25rem',
      }}>
        Admin
      </span>
    </div>
  )
}

export default Logo
