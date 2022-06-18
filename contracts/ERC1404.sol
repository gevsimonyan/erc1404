// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "./interfaces/IERC1404.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC1404 is IERC1404, Ownable {
    /// @dev Official record of token balances for each account
    mapping(address => uint256) private _balances;

    /// @dev Allowance amounts on behalf of others
    mapping(address => mapping(address => uint256)) private _allowances;
    /// @dev Record of addresses that in the whitelist
    mapping(address => bool) public _isInWhitelist;

    /// @notice Total number of tokens in circulation
    uint256 private _totalSupply;

    /// @notice token decimals for this token
    uint8 public _decimals;
    /// @notice token name for this token
    string private _name;
    /// @notice token symbol for this token
    string private _symbol;

    /**
     * @notice Construct a new ERC1404 token
     */

    constructor() {
        _name = "ERC1404";
        _symbol = "WLT";
        _decimals = 18;
        _isInWhitelist[owner()] = true;
    }

    /**
     * @notice Throws if called by any account that not in the whitelist.
     */
    modifier onlyWhitelist() {
        require(
            _isInWhitelist[msg.sender] == true,
            "ERC1404: caller is not in the whitelist"
        );
        _;
    }

    /**
     * @notice Return token name for this token
     * @return The ERC1404 token name
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @notice Return token symbol for this token
     * @return The ERC1404 token symbol
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @notice Return token name for this token
     * @return The ERC1404 token decimals
     */
    function decimals() public view virtual returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Return token name for this token
     * @return The ERC1404 token totalSupply
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @notice Add new user to the whitelist.
     * @param _user The address of the user that been added to the whitelist
     */
    function addToWhitelist(address _user) external override onlyOwner {
        require(_user != address(0), "ERC1404: you can't add zero address");
        require(
            _isInWhitelist[_user] != true,
            "ERC1404: caller is already in whitelist"
        );
        _isInWhitelist[_user] = true;
    }

    /**
     * @notice Remove user to the whitelist.
     * @param _user The address of the user that been removed from the whitelist
     */
    function removeFromWhitelist(address _user) external override onlyOwner {
        require(_user != address(0), "ERC1404: you can't add zero address");
        require(
            _isInWhitelist[_user] != false,
            "ERC1404: user is not in whitelist"
        );
        _isInWhitelist[_user] = false;
    }


    /**
     * @dev Add `amount` tokens to `account`, increase the total supply.
     * @param _account To that account will be added tokens
	 * @param _amount Amount of tokens that will be added to the account
	 */
    function mint(address _account, uint256 _amount) public onlyOwner {
        require(
            _isInWhitelist[_account] == true,
            "ERC1404: _account isn't in whitelist"
        );
        _mint(_account, _amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the total supply.
     * @param _account From that account will be removed tokens from the account
	 * @param _amount Amount of tokens that will be removed from the account
	 */
    function burn(address _account, uint256 _amount) public onlyOwner {
        require(
            _isInWhitelist[_account] == true,
            "ERC1404: _account isn't in whitelist"
        );
        _burn(_account, _amount);
    }

    /**
     * @dev Returns the amount of tokens owned by `account`.
	 * @param account Will retirn balance of that account
     */
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
	 * @param recipient Addres that receieve amount of tokens
	 * @param amount Amount that will be transfered 
     */
    function transfer(address recipient, uint256 amount)
        public
        override
        onlyWhitelist
        returns (bool)
    {
        require(
            _isInWhitelist[recipient] == true,
            "ERC1404: recepient isn't in whitelist"
        );
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
	 * @param owner Owner of tokens that allowed to spend
	 * @param spender Address of spender
     */
    function allowance(address owner, address spender)
        public
        view
        override
        onlyWhitelist
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
	 * @param spender Spender of tokens that will be allowed to spend
	 * @param amount Amount of tokens that will be allowance to spend
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount)
        public
        override
        onlyWhitelist
        returns (bool)
    {
        require(
            _isInWhitelist[spender] == true,
            "ERC1404: recepient isn't in whitelist"
        );
        _approve(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
	 * @param sender From that address will be moved tokens to recipient.
	 * @param recipient Address that receives the amount of tokens.
	 * @param amount Amount to transfer
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override onlyWhitelist returns (bool) {
        require(
            _isInWhitelist[sender] == true,
            "ERC1404: sender isn't in whitelist"
        );

        require(
            _isInWhitelist[recipient] == true,
            "ERC1404: recepient isn't in whitelist"
        );

        _transfer(sender, recipient, amount);

        uint256 currentAllowance = _allowances[sender][msg.sender];

        require(
            currentAllowance >= amount,
            "ERC20: transfer amount exceeds allowance"
        );
        unchecked {
            _approve(sender, msg.sender, currentAllowance - amount);
        }

        return true;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(sender, recipient, amount);

        uint256 senderBalance = _balances[sender];
        require(
            senderBalance >= amount,
            "ERC20: transfer amount exceeds balance"
        );
        unchecked {
            _balances[sender] = senderBalance - amount;
        }
        _balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);

        _afterTokenTransfer(sender, recipient, amount);
    }

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal {}

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal {}
}
