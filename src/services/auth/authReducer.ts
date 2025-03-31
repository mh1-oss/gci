
import { User, Session } from "@supabase/supabase-js";

export type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
};

export type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; session: Session } }
  | { type: 'LOGOUT' }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOADING' }
  | { type: 'SESSION_REFRESH'; payload: { user: User; session: Session } | null };

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOADING':
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload.user,
        session: action.payload.session,
        loading: false,
        error: null
      };
    
    case 'LOGOUT':
      return {
        user: null,
        session: null,
        loading: false,
        error: null
      };
      
    case 'LOGIN_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
      
    case 'SESSION_REFRESH':
      if (action.payload) {
        return {
          user: action.payload.user,
          session: action.payload.session,
          loading: false,
          error: null
        };
      }
      return {
        ...state,
        loading: false
      };
      
    default:
      return state;
  }
};
