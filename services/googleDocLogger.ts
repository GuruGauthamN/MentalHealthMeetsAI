import { GOOGLE_CLIENT_ID, GOOGLE_DOC_ID } from '../constants';
import type { Role, GoogleUserProfile } from '../types';

// This declares the 'gapi' object from the Google API script on the window
declare const gapi: any;
// This declares the 'google' object from the Google Identity Services script on the window
declare const google: any;

interface LogMessageParams {
  role: Role | 'SYSTEM';
  content: string;
  sessionId: string;
}

class GoogleDocLogger {
  private gapiInitialized = false;
  private tokenClient: any = null;

  /**
   * Initializes the Google API client and token client for OAuth2.
   * This method waits for the necessary Google scripts to load before proceeding.
   * @param updateAuthStatusCallback - A function to call with the auth status.
   */
  public initClient = (updateAuthStatusCallback: (isSignedIn: boolean, user: GoogleUserProfile | null) => void) => {
    const attemptInitialization = () => {
      if (typeof gapi === 'undefined' || typeof google === 'undefined') {
        setTimeout(attemptInitialization, 100); // Wait and retry
        return;
      }
      
      this.loadClients(updateAuthStatusCallback);
    };

    attemptInitialization();
  }

  private loadClients = (updateAuthStatusCallback: (isSignedIn: boolean, user: GoogleUserProfile | null) => void) => {
      gapi.load('client', async () => {
        await gapi.client.init({
          apiKey: process.env.API_KEY,
          discoveryDocs: ['https://docs.googleapis.com/$discovery/rest?version=v1'],
        });
        this.gapiInitialized = true;

        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/documents',
          callback: (tokenResponse: any) => {
              if (tokenResponse.error) {
                  console.error('Google Auth Error:', tokenResponse.error);
                  updateAuthStatusCallback(false, null);
                  return;
              }
              this.updateUserStatus(updateAuthStatusCallback);
          },
        });
        // Initial check to see if user is already signed in
        this.updateUserStatus(updateAuthStatusCallback);
      });
  }

  private async updateUserStatus(callback: (isSignedIn: boolean, user: GoogleUserProfile | null) => void) {
    const token = gapi.client.getToken();
    const isSignedIn = token !== null;
    
    if (isSignedIn) {
        try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { 'Authorization': `Bearer ${token.access_token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch user info');
            const profile = await res.json();
            const user: GoogleUserProfile = {
                name: profile.name,
                email: profile.email,
                imageUrl: profile.picture
            };
            callback(true, user);
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            callback(false, null);
        }
    } else {
        callback(false, null);
    }
  }


  /**
   * Initiates the Google Sign-In flow.
   */
  public signIn = () => {
    if (this.tokenClient) {
        // Prompt user to select an account and grant consent for the specified scope
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        console.error('Token client not initialized. Cannot sign in.');
    }
  };

  /**
   * Signs the user out.
   */
  public signOut = () => {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token, () => {
        gapi.client.setToken(null);
        // The parent component will re-render via the callback in initClient
      });
    }
  };

  /**
   * Appends a formatted message to the configured Google Doc.
   * @param {LogMessageParams} messageDetails - The message details to log.
   */
  public logMessage = async ({ role, content, sessionId }: LogMessageParams) => {
    if (!this.gapiInitialized || gapi.client.getToken() === null) {
      console.warn('Cannot log message: Google client not ready or user not signed in.');
      return;
    }
    
    // Privacy Warning: Logging sensitive data to a single document shared among users
    // is a significant privacy risk. This implementation is for demonstration purposes
    // and should not be used in a production environment with real user data without
    // a robust privacy and security review, and likely a different architecture
    // (e.g., logging to each user's own private document).
    
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] (Session: ${sessionId}) [${role.toUpperCase()}]: ${content}\n`;
    
    try {
        // To append text, we must insert it at the end of the document body.
        // This requires a `get` request to find the current end index, which is inefficient
        // but required by the Google Docs API v1.
        const doc = await gapi.client.docs.documents.get({
            documentId: GOOGLE_DOC_ID,
            fields: 'body(content(endIndex))'
        });

        const endIndex = doc.result.body.content[doc.result.body.content.length - 1].endIndex - 1;
        
        const requests = [{
            insertText: {
                text: logEntry,
                location: { index: endIndex > 1 ? endIndex : 1 },
            }
        }];

        await gapi.client.docs.documents.batchUpdate({
            documentId: GOOGLE_DOC_ID,
            resource: { requests },
        });

    } catch (error) {
        console.error('Error logging to Google Doc:', error);
    }
  };
}

// Export a singleton instance of the logger
export const googleDocLogger = new GoogleDocLogger();