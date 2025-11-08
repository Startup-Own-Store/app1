import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const COLORS = {
  PRIMARY: '#00796B',
  BACKGROUND: '#FFFFFF',
  SURFACE: '#FFFFFF',
  SURFACE_ALT: '#F8F9FA',
  TEXT_PRIMARY: '#212529',
  TEXT_SECONDARY: '#6C757D',
  BORDER: '#DEE2E6',
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HelpSupp = () => {
  const [expanded, setExpanded] = useState(false);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={{ height: StatusBar.currentHeight }} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Text style={styles.header}>Help & Support</Text>

          <Text style={styles.subheader}>
            Need help? Our team is here for you.
          </Text>

          {/* CONTACT BOX */}
          <View style={styles.contactBox}>
            <MaterialIcons name="mail-outline" size={28} color={COLORS.PRIMARY} />
            <View style={{ flex: 1 }}>
              <Text style={styles.contactTitle}>Contact Us</Text>
              <Text style={styles.contactText}>main@ownstore.org</Text>
            </View>

            <TouchableOpacity
              onPress={() => Linking.openURL('mailto:main@ownstore.org')}
            >
              <MaterialIcons name="send" size={26} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* TERMS DROPDOWN */}
          <TouchableOpacity style={styles.dropdownHeader} onPress={toggleDropdown}>
            <Text style={styles.dropdownTitle}>Terms & Conditions</Text>
            <MaterialIcons
              name={expanded ? 'expand-less' : 'expand-more'}
              size={28}
              color={COLORS.PRIMARY}
            />
          </TouchableOpacity>

          {expanded && (
            <View style={styles.dropdownContent}>
              <Text style={styles.tcText}>
                <Text style={styles.tcHeading}>Last Updated: 8 November 2025</Text>
                {'\n\n'}

                1. Acceptance of Terms{'\n'}
                By downloading, accessing, or using the OwnStore mobile application, you agree to be bound by these Terms and Conditions. If you do not agree, you must stop using the app immediately.{'\n\n'}

                2. About the Service{'\n'}
                OwnStore is a platform that connects users with independent service professionals for home services, repairs, consultations, and other assistance. OwnStore does not employ, control, or take responsibility for the service providers listed in the app.{'\n\n'}

                3. User Account{'\n'}
                You are responsible for maintaining the confidentiality of your account. You must notify us immediately if you suspect unauthorized access or misuse.{'\n\n'}

                4. Service Requests{'\n'}
                When you submit a hire request, you authorize OwnStore to share your details with relevant service professionals. The availability of professionals is not guaranteed. OwnStore may refuse, cancel, or modify any request if suspicious or incomplete.{'\n\n'}

                5. Responsibilities of Users{'\n'}
                You agree to provide accurate job details, ensure safe access, behave respectfully, and avoid fraudulent or illegal activities. Violations may lead to suspension.{'\n\n'}

                7. Responsibilities of Service Providers{'\n'}
                Providers are independent contractors responsible for accurate service info, punctuality, safety, and legal compliance. OwnStore is not liable for their conduct.{'\n\n'}

                8. Cancellations and Rescheduling{'\n'}
                You may cancel before the professional arrives. Frequent cancellations may lead to restrictions. Last-minute cancellations may incur charges.{'\n\n'}

                9. Safety and Verification{'\n'}
                OwnStore attempts verification but cannot guarantee accuracy, skills, or behavior. Use personal judgment.{'\n\n'}

                10. Prohibited Activities{'\n'}
                You must not misuse the platform, hack, collect data illegally, impersonate, or use it for unlawful activity. Violations may result in legal action.{'\n\n'}

                11. Limitation of Liability{'\n'}
                OwnStore is not responsible for damages, injuries, delays, or indirect losses caused by providers or app use. You use the app at your own risk.{'\n\n'}

                12. Privacy{'\n'}
                Your data is handled according to our Privacy Policy.{'\n\n'}

                13. Third-Party Services{'\n'}
                OwnStore is not responsible for failures caused by APIs, maps, payment gateways, or analytics tools.{'\n\n'}

                14. Intellectual Property{'\n'}
                All branding and content belong to OwnStore. Copying or distributing without permission is prohibited.{'\n\n'}

                15. Updates to Terms{'\n'}
                Terms may change anytime. Continued use means acceptance.{'\n\n'}

                16. Termination{'\n'}
                We may suspend or terminate access if you violate the Terms.{'\n\n'}

                17. Governing Law{'\n'}
                Governed by laws of India. Disputes will be handled under Indian jurisdiction.{'\n\n'}

                18. Contact{'\n'}
                For support: main@ownstore.org
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  container: {
    paddingHorizontal: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 10,
  },
  subheader: {
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 24,
    marginTop: 4,
  },
  contactBox: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 26,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  contactText: {
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE_ALT,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  dropdownTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  dropdownContent: {
    marginTop: 12,
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 16,
    padding: 18,
  },
  tcText: {
    fontSize: 14.5,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 22,
  },
  tcHeading: {
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
  },
});

export default HelpSupp;
