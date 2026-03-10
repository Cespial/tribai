import Testing
import Foundation
@testable import SuperAppTributaria

struct AccountDeletionTests {

    // MARK: - deleteAccount clears currentUser

    @Test func deleteAccountSetsCurrentUserToNil() {
        let service = AuthService()
        // Set up an authenticated state via anonymous login
        service.continueWithoutAccount()
        #expect(service.currentUser != nil)

        service.deleteAccount()
        #expect(service.currentUser == nil)
    }

    // MARK: - deleteAccount sets isAuthenticated to false

    @Test func deleteAccountSetsIsAuthenticatedToFalse() {
        let service = AuthService()
        service.continueWithoutAccount()
        #expect(service.isAuthenticated == true)

        service.deleteAccount()
        #expect(service.isAuthenticated == false)
    }

    // MARK: - signOut also clears user

    @Test func signOutClearsCurrentUser() {
        let service = AuthService()
        service.continueWithoutAccount()
        #expect(service.isAuthenticated == true)

        service.signOut()
        #expect(service.currentUser == nil)
        #expect(service.isAuthenticated == false)
    }

    // MARK: - deleteAccount on already signed-out user

    @Test func deleteAccountOnSignedOutUserIsNoOp() {
        let service = AuthService()
        // Don't sign in — user is nil
        #expect(service.currentUser == nil)
        #expect(service.isAuthenticated == false)

        // Should not crash
        service.deleteAccount()
        #expect(service.currentUser == nil)
        #expect(service.isAuthenticated == false)
    }

    // MARK: - Anonymous user properties

    @Test func anonymousUserHasExpectedProperties() {
        let service = AuthService()
        service.continueWithoutAccount()

        let user = service.currentUser
        #expect(user != nil)
        #expect(user?.provider == .anonymous)
        #expect(user?.email == nil)
        #expect(user?.displayName == nil)
        #expect(user?.id.isEmpty == false)
    }
}
