import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../styles/theme';
import PrimaryButton from './PrimaryButton';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops, something went wrong.</Text>
          <Text style={styles.text}>The application encountered an unexpected error.</Text>
          
          <View style={styles.errorBox}>
            <Text style={styles.errorMsg}>{this.state.error?.message}</Text>
            <Text style={styles.errorStack} numberOfLines={8}>
              {this.state.error?.stack}
            </Text>
          </View>

          <PrimaryButton 
            title="Try Again" 
            onPress={() => this.setState({ hasError: false, error: null })} 
            style={styles.button}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.bg,
  },
  title: {
    ...typography.h2,
    color: colors.error,
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    width: '60%',
  },
  errorBox: {
    backgroundColor: '#1A1D1B',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.2)',
  },
  errorMsg: {
    ...typography.bodyBold,
    color: colors.error,
    marginBottom: 5,
  },
  errorStack: {
    ...typography.small,
    color: colors.textMuted,
    fontFamily: 'System',
  }
});
