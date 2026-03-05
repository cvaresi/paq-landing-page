import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { COLORS } from './sceneConfig';

type Props = {
  frameIndex: number;
  isMobile: boolean;
};

const textColor = COLORS.black;

const baseFontFamily =
  'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const fadeVariants = {
  initial: { opacity: 0, y: -10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.4 },
  },
};

const isRightLayoutFrame = (frame: number) =>
  frame === 0 || frame === 1 || frame === 2 || frame === 5 || frame === 7;

const isBottomCenterFrame = (frame: number) =>
  frame === 3 || frame === 4;

export const TextOverlay: React.FC<Props> = ({ frameIndex, isMobile }) => {
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    pointerEvents: 'none',
    fontFamily: baseFontFamily,
    color: textColor,
  };

  let justifyContent: React.CSSProperties['justifyContent'] = 'center';
  let alignItems: React.CSSProperties['alignItems'] = 'center';
  let padding: string | number = '5%';

  if (isRightLayoutFrame(frameIndex) && !isMobile) {
    justifyContent = 'flex-end';
    alignItems = 'center';
    padding = '0 7% 0 4%';
  } else if (isBottomCenterFrame(frameIndex) || isMobile) {
    justifyContent = 'center';
    alignItems = 'flex-end';
    padding = '0 5% 6% 5%';
  }

  const contentStyle: React.CSSProperties = {
    maxWidth: isMobile ? '90%' : '40%',
    textAlign:
      isRightLayoutFrame(frameIndex) && !isMobile ? 'left' : 'center',
    pointerEvents: 'auto',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: isMobile ? '1.1rem' : '1.4rem',
    lineHeight: 1.4,
    fontWeight: 400,
    margin: 0,
  };

  const boldStyle: React.CSSProperties = {
    fontWeight: 700,
  };

  const smallStyle: React.CSSProperties = {
    fontSize: isMobile ? '0.8rem' : '0.9rem',
    marginTop: '0.75rem',
  };

  const logoStyle: React.CSSProperties = {
    fontSize: isMobile ? '1.1rem' : '1.2rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: COLORS.magenta,
    marginBottom: '0.35rem',
  };

  const heroRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: isMobile ? '0.6rem' : '0.9rem',
    marginTop: '1.1rem',
    fontSize: isMobile ? '0.7rem' : '0.85rem',
    fontWeight: 700,
    color: '#ffffff',
  };

  const heroPillStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 999,
    padding: isMobile ? '0.25rem 0.55rem' : '0.35rem 0.8rem',
  };

  const renderFrameContent = () => {
    switch (frameIndex) {
      case 0:
        return (
          <>
            <p style={headingStyle}>
              In targeted therapy launches, there are some
            </p>
            <p style={{ ...headingStyle, marginTop: '0.35rem' }}>
              <span style={boldStyle}>factors you can&apos;t control</span>
            </p>
          </>
        );
      case 1:
        return (
          <>
            <p style={headingStyle}>Everything else makes up</p>
            <p style={{ ...headingStyle, marginTop: '0.35rem' }}>
              <span style={boldStyle}>your LAUNCH QUOTIENT</span>
            </p>
          </>
        );
      case 2:
        return (
          <p style={{ ...headingStyle, ...boldStyle }}>
            Workstream prioritization
          </p>
        );
      case 3:
        return (
          <p style={{ ...headingStyle, ...boldStyle }}>
            Process-subverting time pressures
          </p>
        );
      case 4:
        return (
          <p style={{ ...headingStyle, ...boldStyle }}>
            Cross-functional team alignment
          </p>
        );
      case 5:
        return (
          <p style={{ ...headingStyle, ...boldStyle }}>
            Market-attuned strategies
          </p>
        );
      case 6:
        return (
          <p style={{ ...headingStyle, ...boldStyle }}>
            Creative alchemy
          </p>
        );
      case 7:
      default:
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div style={logoStyle}>PRECISION AQ™</div>
            <div
              style={{
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: 600,
                marginBottom: '0.35rem',
              }}
            >
              accounts for the
            </div>
            <div style={heroRowStyle}>
              <span style={heroPillStyle}>processes</span>
              <span style={heroPillStyle}>people</span>
              <span style={heroPillStyle}>strategies</span>
              <span style={heroPillStyle}>subjectivities</span>
            </div>
            <div style={smallStyle}>
              <em>Know where you stand on the go-to-market curve</em>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ ...containerStyle, justifyContent, alignItems, padding }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={frameIndex}
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={contentStyle}
        >
          {renderFrameContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TextOverlay;

