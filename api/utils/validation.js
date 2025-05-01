/**
 * Validation utility functions for API requests
 */

/**
 * Validates an Ethereum address
 * @param {string} address - The Ethereum address to validate
 * @returns {boolean} True if the address is valid
 */
function isValidEthereumAddress(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates a transaction hash
 * @param {string} hash - The transaction hash to validate
 * @returns {boolean} True if the hash is valid
 */
function isValidTransactionHash(hash) {
  if (!hash || typeof hash !== 'string') {
    return false;
  }
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validates a chain ID
 * @param {string|number} chainId - The chain ID to validate
 * @returns {boolean} True if the chain ID is valid
 */
function isValidChainId(chainId) {
  if (chainId === undefined || chainId === null) {
    return false;
  }

  // Convert to number if it's a string
  const id = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;

  // Check if it's a positive integer
  return Number.isInteger(id) && id > 0;
}

/**
 * Validates a keystore file path
 * @param {string} path - The file path to validate
 * @returns {boolean} True if the path is valid
 */
function isValidKeystorePath(path) {
  if (!path || typeof path !== 'string') {
    return false;
  }

  // Check if the path has a valid keystore filename pattern
  // Standard format: UTC--YYYYMMDDHHMMSS--address.json
  if (/UTC--\d{14}--[a-f0-9]{40}\.json$/i.test(path)) {
    return true;
  }

  // Also accept any JSON file as a fallback
  return path.toLowerCase().endsWith('.json');
}

/**
 * Validates a boolean value
 * @param {any} value - The value to validate
 * @returns {boolean} True if the value is a valid boolean
 */
function isValidBoolean(value) {
  if (typeof value === 'boolean') {
    return true;
  }

  if (typeof value === 'string') {
    const lowercased = value.toLowerCase();
    return lowercased === 'true' || lowercased === 'false';
  }

  return false;
}

/**
 * Converts a value to a boolean
 * @param {any} value - The value to convert
 * @returns {boolean} The converted boolean value
 */
function toBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const lowercased = value.toLowerCase();
    return lowercased === 'true';
  }

  return Boolean(value);
}

/**
 * Validates KYC verification request
 * @param {Object} body - The request body
 * @returns {Object} Validation result with isValid and error properties
 */
function validateKYCVerifyRequest(body) {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  if (!body.address) {
    return { isValid: false, error: 'Address is required' };
  }

  if (!isValidEthereumAddress(body.address)) {
    return { isValid: false, error: 'Invalid Ethereum address format' };
  }

  return { isValid: true };
}

/**
 * Validates admin change request
 * @param {Object} body - The request body
 * @returns {Object} Validation result with isValid and error properties
 */
function validateChangeAdminRequest(body) {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  if (!body.newAdmin) {
    return { isValid: false, error: 'New admin address is required' };
  }

  if (!isValidEthereumAddress(body.newAdmin)) {
    return {
      isValid: false,
      error: 'Invalid Ethereum address format for new admin'
    };
  }

  return { isValid: true };
}

/**
 * Validates batch verification request
 * @param {Object} body - The request body
 * @returns {Object} Validation result with isValid and error properties
 */
function validateBatchVerifyRequest(body) {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  if (
    !body.addresses ||
    !Array.isArray(body.addresses) ||
    body.addresses.length === 0
  ) {
    return {
      isValid: false,
      error: 'Addresses array is required and must not be empty'
    };
  }

  // Check if all addresses are valid
  const invalidAddresses = body.addresses.filter(
    (addr) => !isValidEthereumAddress(addr)
  );
  if (invalidAddresses.length > 0) {
    return {
      isValid: false,
      error: `Invalid Ethereum address format for ${invalidAddresses.length} addresses`
    };
  }

  // Validate verified flag if present
  if (body.verified !== undefined && !isValidBoolean(body.verified)) {
    return { isValid: false, error: 'Verified flag must be a boolean value' };
  }

  return { isValid: true };
}

module.exports = {
  validateKYCVerifyRequest,
  validateChangeAdminRequest,
  isValidEthereumAddress,
  isValidKeystorePath
};
