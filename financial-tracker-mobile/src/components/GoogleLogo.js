import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GoogleLogo = ({ size = 20 }) => {
    const segmentWidth = size * 0.45;
    const segmentHeight = size * 0.45;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* 
        This is a CSS-based recreation of the multicolored Google "G".
        For a more perfect look on mobile, we use 4 colored quadrants.
      */}
            <View style={styles.gWrapper}>
                <View style={[styles.segment, styles.red, { top: 0, left: 0 }]} />
                <View style={[styles.segment, styles.yellow, { bottom: 0, left: 0 }]} />
                <View style={[styles.segment, styles.green, { bottom: 0, right: 0 }]} />
                <View style={[styles.segment, styles.blue, { top: 0, right: 0 }]} />
                <View style={styles.centerHole} />
                <View style={styles.gPlate}>
                    <Text style={[styles.gText, { fontSize: size * 0.8, lineHeight: size }]}>G</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: 4,
    },
    gWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    segment: {
        position: 'absolute',
        width: '60%',
        height: '60%',
    },
    red: { backgroundColor: '#EA4335' },
    yellow: { backgroundColor: '#FBBC05' },
    green: { backgroundColor: '#34A853' },
    blue: { backgroundColor: '#4285F4' },
    centerHole: {
        position: 'absolute',
        width: '40%',
        height: '40%',
        backgroundColor: '#020617', // Match background
        borderRadius: 10,
        zIndex: 1,
    },
    gPlate: {
        position: 'absolute',
        zIndex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gText: {
        fontWeight: '900',
        color: '#fff',
        backgroundColor: 'transparent',
        textAlign: 'center',
    }
});

export default GoogleLogo;
