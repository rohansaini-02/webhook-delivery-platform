import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../styles/theme';
import PrimaryButton from './PrimaryButton';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
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
          <PrimaryButton 
            title="Try Again" 
            onPress={() => this.setState({ hasError: false })} 
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
});
