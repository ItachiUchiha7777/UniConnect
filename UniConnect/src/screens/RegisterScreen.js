import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Pressable
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import API from '../api/api'; // your axios instance
import { colors } from '../colors';

const states = [
  { label: 'Andhra Pradesh', value: 'Andhra Pradesh' },
  { label: 'Arunachal Pradesh', value: 'Arunachal Pradesh' },
  { label: 'Assam', value: 'Assam' },
  { label: 'Bihar', value: 'Bihar' },
  { label: 'Chhattisgarh', value: 'Chhattisgarh' },
  { label: 'Goa', value: 'Goa' },
  { label: 'Gujarat', value: 'Gujarat' },
  { label: 'Haryana', value: 'Haryana' },
  { label: 'Himachal Pradesh', value: 'Himachal Pradesh' },
  { label: 'Jharkhand', value: 'Jharkhand' },
  { label: 'Karnataka', value: 'Karnataka' },
  { label: 'Kerala', value: 'Kerala' },
  { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
  { label: 'Maharashtra', value: 'Maharashtra' },
  { label: 'Manipur', value: 'Manipur' },
  { label: 'Meghalaya', value: 'Meghalaya' },
  { label: 'Mizoram', value: 'Mizoram' },
  { label: 'Nagaland', value: 'Nagaland' },
  { label: 'Odisha', value: 'Odisha' },
  { label: 'Punjab', value: 'Punjab' },
  { label: 'Rajasthan', value: 'Rajasthan' },
  { label: 'Sikkim', value: 'Sikkim' },
  { label: 'Tamil Nadu', value: 'Tamil Nadu' },
  { label: 'Telangana', value: 'Telangana' },
  { label: 'Tripura', value: 'Tripura' },
  { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
  { label: 'Uttarakhand', value: 'Uttarakhand' },
  { label: 'West Bengal', value: 'West Bengal' }
];

const courses = [
  { label: 'B.Tech CSE', value: 'B.Tech CSE' },
  { label: 'B.Tech IT', value: 'B.Tech IT' },
  { label: 'B.Tech ECE', value: 'B.Tech ECE' },
  { label: 'B.Tech Mech', value: 'B.Tech Mech' },
  { label: 'B.Tech Civil', value: 'B.Tech Civil' },
  { label: 'B.Tech Electrical', value: 'B.Tech Electrical' },
  { label: 'B.Tech Chemical Eng', value: 'B.Tech Chemical Eng' },
  { label: 'B.Tech Aerospace Eng', value: 'B.Tech Aerospace Eng' },
  { label: 'B.Sc Agriculture', value: 'B.Sc Agriculture' },
  { label: 'B.Sc Horticulture', value: 'B.Sc Horticulture' },
  { label: 'B.Sc Forestry', value: 'B.Sc Forestry' },
  { label: 'B.Sc Biotechnology', value: 'B.Sc Biotechnology' },
  { label: 'BBA', value: 'BBA' },
  { label: 'BCA', value: 'BCA' },
  { label: 'B.Com', value: 'B.Com' },
  { label: 'B.A', value: 'B.A' },
  { label: 'B.Sc Physics', value: 'B.Sc Physics' },
  { label: 'B.Sc Chemistry', value: 'B.Sc Chemistry' },
  { label: 'B.Sc Mathematics', value: 'B.Sc Mathematics' },
  { label: 'B.Pharm', value: 'B.Pharm' },
  { label: 'B.Arch', value: 'B.Arch' },
  { label: 'LLB', value: 'LLB' }
];

// Adjusted years: from currentYear-7 to currentYear+7 (15 years)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 15 }, (_, i) => ({
  label: `${currentYear - 7 + i}`,
  value: `${currentYear - 7 + i}`,
}));

const renderDropdownItem = (item, selected) => (
  <Pressable
    style={({ pressed }) => [
      {
        backgroundColor: pressed
          ? '#222'
          : selected
            ? colors.primary + '33' // light highlight
            : colors.surface,
        paddingVertical: 10,
        paddingHorizontal: 12,
      },
    ]}
  >
    <Text style={{ color: selected ? colors.primary : colors.text, fontSize: 16 }}>
      {item.label}
    </Text>
  </Pressable>
);

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    state: '',
    course: '',
    passingYear: '',
    registrationNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.state ||
      !form.course ||
      !form.passingYear ||
      !form.registrationNumber
    ) {
      alert('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await API.post('/auth/register', form);
      alert('Registration successful! Please login.');
      navigation.goBack();
    } catch (error) {
      alert('Registration failed: ' + (error?.response?.data?.message || error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoiding}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 60 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join our student community today</Text>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#888"
          value={form.name}
          onChangeText={v => handleChange('name', v)}
        />

        <Text style={styles.label}>Registration Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter registration/roll number"
          placeholderTextColor="#888"
          keyboardType="number-pad"
          value={form.registrationNumber}
          onChangeText={v => handleChange('registrationNumber', v.replace(/[^0-9]/g, ''))}
        />

        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email address"
          placeholderTextColor="#888"
          autoCapitalize="none"
          keyboardType="email-address"
          value={form.email}
          onChangeText={v => handleChange('email', v)}
        />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter 10-digit phone number"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          maxLength={10}
          value={form.phone}
          onChangeText={v => handleChange('phone', v.replace(/[^0-9]/g, ''))}
        />

        <Text style={styles.label}>Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a strong password"
          placeholderTextColor="#888"
          secureTextEntry
          value={form.password}
          onChangeText={v => handleChange('password', v)}
        />

        <Text style={styles.label}>State *</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={states}
          // search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select State"
          searchPlaceholder="Search..."
          value={form.state}
          onChange={item => handleChange('state', item.value)}
          renderItem={item => renderDropdownItem(item, form.state === item.value)}
        />

        <Text style={styles.label}>Course *</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={courses}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select Course"
          searchPlaceholder="Search..."
          value={form.course}
          onChange={item => handleChange('course', item.value)}
          renderItem={item => renderDropdownItem(item, form.course === item.value)}
        />

        <Text style={styles.label}>Passing Year *</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyleNoBorder} // no border here
          iconStyle={styles.iconStyle}
          data={years}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select Passing Year"
          value={form.passingYear}
          onChange={item => handleChange('passingYear', item.value)}
          renderItem={item => renderDropdownItem(item, form.passingYear === item.value)}
        />

        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <Button
              title="Create Account"
              onPress={handleRegister}
              color={colors.primary}
            />
          )}
        </View>

        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.goBack()}>
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </TouchableOpacity>
        <Text style={styles.terms}>By registering, you agree to our terms and conditions</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 0,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#444',
    fontSize: 16,
  },
  label: {
    color: colors.text,
    marginBottom: 4,
    marginTop: 12,
    fontWeight: 'bold',
  },
  dropdown: {
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#888',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: colors.text,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#444'  // keeps border for search input to differentiate
  },
  // No border variant for search input to remove white border (you can adjust)
  inputSearchStyleNoBorder: {
    height: 40,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  loginLink: {
    marginTop: 12,
    alignSelf: 'center',
  },
  loginText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  terms: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});
