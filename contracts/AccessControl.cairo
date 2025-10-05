%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin
from starkware.starknet.common.syscalls import get_caller_address
from starkware.starknet.storage.storage import Storage
from starkware.cairo.common.alloc import alloc

// Storage variables
@storage_var
func admin_role() -> (res: felt) {
}

@storage_var
func operator_role() -> (res: felt) {
}

@storage_var
func roles(account: felt) -> (res: felt) {
}

@storage_var
func role_members(role: felt, index: felt) -> (res: felt) {
}

@storage_var
func role_member_count(role: felt) -> (res: felt) {
}

// Role constants
const ROLE_NONE = 0;
const ROLE_ADMIN = 1;
const ROLE_OPERATOR = 2;

// Events
@event
func RoleGranted(
    role: felt,
    account: felt,
    sender: felt
) {
}

@event
func RoleRevoked(
    role: felt,
    account: felt,
    sender: felt
) {
}

// Constructor
@constructor
func constructor() {
    let (deployer) = get_caller_address();

    // Set initial roles
    admin_role.write(ROLE_ADMIN);
    operator_role.write(ROLE_OPERATOR);

    // Grant admin role to deployer
    roles.write(deployer, ROLE_ADMIN);

    // Add to role members
    role_members.write(ROLE_ADMIN, 0, deployer);
    role_member_count.write(ROLE_ADMIN, 1);

    return ();
}

// External functions

@external
func grant_role(role: felt, account: felt) -> () {
    alloc_locals;

    let (caller) = get_caller_address();
    let (has_admin_role) = has_role(ROLE_ADMIN, caller);

    // Only admin can grant roles
    assert_not_zero(has_admin_role);

    // Grant role to account
    roles.write(account, role);

    // Add to role members if not already present
    let (member_count) = role_member_count.read(role);
    let (already_member) = is_role_member(role, account, member_count);

    if (already_member == 0) {
        role_members.write(role, member_count, account);
        role_member_count.write(role, member_count + 1);
    }

    // Emit event
    RoleGranted.emit(
        role=role,
        account=account,
        sender=caller
    );

    return ();
}

@external
func revoke_role(role: felt, account: felt) -> () {
    alloc_locals;

    let (caller) = get_caller_address();
    let (has_admin_role) = has_role(ROLE_ADMIN, caller);

    // Only admin can revoke roles
    assert_not_zero(has_admin_role);

    // Revoke role
    roles.write(account, ROLE_NONE);

    // Remove from role members (simplified - in production would need proper array management)
    let (member_count) = role_member_count.read(role);
    if (member_count > 0) {
        role_member_count.write(role, member_count - 1);
    }

    // Emit event
    RoleRevoked.emit(
        role=role,
        account=account,
        sender=caller
    );

    return ();
}

// View functions

@view
func has_role(role: felt, account: felt) -> (has_role: felt) {
    let (account_role) = roles.read(account);

    if (account_role == role) {
        return (1);
    } else {
        return (0);
    }
}

@view
func get_role(account: felt) -> (role: felt) {
    let (account_role) = roles.read(account);
    return (account_role);
}

@view
func get_admin_role() -> (role: felt) {
    let (admin) = admin_role.read();
    return (admin);
}

@view
func get_operator_role() -> (role: felt) {
    let (operator) = operator_role.read();
    return (operator);
}

@view
func get_role_member_count(role: felt) -> (count: felt) {
    let (count) = role_member_count.read(role);
    return (count);
}

@view
func is_role_member(role: felt, account: felt, count: felt) -> (is_member: felt) {
    alloc_locals;

    if (count == 0) {
        return (0);
    }

    let (member) = role_members.read(role, count - 1);

    if (member == account) {
        return (1);
    } else {
        return is_role_member(role, account, count - 1);
    }
}