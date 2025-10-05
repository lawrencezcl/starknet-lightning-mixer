import {
  formatAddress,
  formatAmount,
  formatTokenAmount,
  calculateFee,
  calculateNetAmount,
  generateId,
  isValidStarknetAddress,
  hexToString,
  stringToHex,
  calculatePercentage,
  formatDuration,
  debounce,
  isRecentTransaction,
  getPrivacyScore,
  copyToClipboard,
} from '../utils';
import { PrivacySettings } from '@/types/mixer';

// Mock window methods
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('Utility Functions', () => {
  describe('formatAddress', () => {
    it('should format address correctly', () => {
      const address = '0x1234567890123456789012345678901234567890123456789012345678901234';
      expect(formatAddress(address, 6)).toBe('0x123456...901234');
    });

    it('should return empty string for null/undefined address', () => {
      expect(formatAddress('')).toBe('');
      expect(formatAddress(null as any)).toBe('');
      expect(formatAddress(undefined as any)).toBe('');
    });

    it('should use default length when not specified', () => {
      const address = '0x1234567890123456789012345678901234567890123456789012345678901234';
      expect(formatAddress(address)).toBe('0x123456...901234');
    });
  });

  describe('formatAmount', () => {
    it('should format number amount correctly', () => {
      expect(formatAmount(1234.5678)).toBe('1,234.5678');
      expect(formatAmount(1234.5678, 2)).toBe('1,234.57');
    });

    it('should format string amount correctly', () => {
      expect(formatAmount('1234.5678')).toBe('1,234.5678');
      expect(formatAmount('1234.5678', 2)).toBe('1,234.57');
    });

    it('should return 0 for invalid amount', () => {
      expect(formatAmount('invalid')).toBe('0');
      expect(formatAmount(NaN)).toBe('0');
    });

    it('should handle zero amount', () => {
      expect(formatAmount(0)).toBe('0');
      expect(formatAmount('0')).toBe('0');
    });
  });

  describe('formatTokenAmount', () => {
    it('should format token amount with symbol', () => {
      expect(formatTokenAmount(1234.5678, 'ETH')).toBe('1,234.5678 ETH');
      expect(formatTokenAmount(1234.5678, 'ETH', 2)).toBe('1,234.57 ETH');
    });
  });

  describe('calculateFee', () => {
    it('should calculate fee correctly', () => {
      expect(calculateFee(1000, 0.005)).toBe(5);
      expect(calculateFee(1000, 0.01)).toBe(10);
    });

    it('should handle zero amount', () => {
      expect(calculateFee(0, 0.005)).toBe(0);
    });
  });

  describe('calculateNetAmount', () => {
    it('should calculate net amount after fee', () => {
      expect(calculateNetAmount(1000, 0.005)).toBe(995);
      expect(calculateNetAmount(1000, 0.01)).toBe(990);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId('test');
      const id2 = generateId('test');

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^test_\d+_[a-z0-9]+$/);
    });

    it('should generate ID without prefix', () => {
      const id = generateId();
      expect(id).toMatch(/^\d+_[a-z0-9]+$/);
    });
  });

  describe('isValidStarknetAddress', () => {
    it('should validate correct Starknet address', () => {
      const validAddress = '0x1234567890123456789012345678901234567890123456789012345678901234';
      expect(isValidStarknetAddress(validAddress)).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(isValidStarknetAddress('0x123')).toBe(false);
      expect(isValidStarknetAddress('1234567890123456789012345678901234567890123456789012345678901234')).toBe(false);
      expect(isValidStarknetAddress('0xG234567890123456789012345678901234567890123456789012345678901234')).toBe(false);
    });
  });

  describe('hexToString', () => {
    it('should convert hex to string', () => {
      const hex = stringToHex('hello');
      expect(hexToString(hex)).toBe('hello');
    });

    it('should handle invalid hex', () => {
      expect(hexToString('invalid')).toBe('invalid');
    });
  });

  describe('stringToHex', () => {
    it('should convert string to hex', () => {
      expect(stringToHex('hello')).toMatch(/^0x68656c6c6f$/);
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(1, 3)).toBeCloseTo(33.33, 2);
    });

    it('should handle zero total', () => {
      expect(calculatePercentage(25, 0)).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('should format duration correctly', () => {
      expect(formatDuration(3661)).toBe('1h 1m'); // 1 hour 1 minute
      expect(formatDuration(3600)).toBe('1h 0m'); // 1 hour
      expect(formatDuration(1800)).toBe('30m'); // 30 minutes
      expect(formatDuration(59)).toBe('< 1m'); // less than 1 minute
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      // Call multiple times quickly
      debouncedFn('call1');
      debouncedFn('call2');
      debouncedFn('call3');

      // Should not have been called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Fast forward time
      jest.advanceTimersByTime(100);

      // Should have been called once with last argument
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call3');
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('isRecentTransaction', () => {
    it('should identify recent transactions', () => {
      const now = Date.now();
      const recentTimestamp = now - 23 * 60 * 60 * 1000; // 23 hours ago
      const oldTimestamp = now - 25 * 60 * 60 * 1000; // 25 hours ago

      expect(isRecentTransaction(recentTimestamp)).toBe(true);
      expect(isRecentTransaction(oldTimestamp)).toBe(false);
    });
  });

  describe('getPrivacyScore', () => {
    it('should calculate privacy score correctly', () => {
      const settings: PrivacySettings = {
        privacyLevel: 'high',
        delayHours: 8,
        splitIntoMultiple: true,
        splitCount: 5,
        useRandomAmounts: true,
      };

      const score = getPrivacyScore(settings);
      expect(score).toBe(100); // Maximum score
    });

    it('should calculate lower score for minimal privacy', () => {
      const settings: PrivacySettings = {
        privacyLevel: 'low',
        delayHours: 0,
        splitIntoMultiple: false,
        splitCount: 1,
        useRandomAmounts: false,
      };

      const score = getPrivacyScore(settings);
      expect(score).toBe(60); // Base + low level
    });

    it('should cap score at 100', () => {
      const settings: PrivacySettings = {
        privacyLevel: 'high',
        delayHours: 24,
        splitIntoMultiple: true,
        splitCount: 10,
        useRandomAmounts: true,
      };

      const score = getPrivacyScore(settings);
      expect(score).toBe(100); // Should not exceed 100
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      const result = await copyToClipboard('test text');
      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith('test text');
    });

    it('should handle clipboard API failure', async () => {
      // Mock clipboard API failure
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockRejectedValue(new Error('Clipboard API not supported')),
        },
      });

      // Mock execCommand for fallback
      const mockExecCommand = jest.fn().mockReturnValue(true);
      const mockElement = {
        value: '',
        style: { position: '', opacity: '' },
        select: jest.fn(),
      };
      const mockCreateElement = jest.fn().mockReturnValue(mockElement);
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();

      // Use Object.defineProperty to properly mock document.body
      Object.defineProperty(document, 'createElement', {
        value: mockCreateElement,
        writable: true,
      });

      Object.defineProperty(document, 'body', {
        value: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
        writable: true,
      });

      Object.defineProperty(document, 'execCommand', {
        value: mockExecCommand,
        writable: true,
      });

      const result = await copyToClipboard('test text');
      expect(result).toBe(true);
    });
  });
});