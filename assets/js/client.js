import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const URL = 'https://rweobvlvlwlljzykutuw.supabase.co';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3ZW9idmx2bHdsbGp6eWt1dHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NzI4NjEsImV4cCI6MjA2MTU0ODg2MX0.kq8yiRyTeRjiBa2ngWjulQ_UmI55VaB262x6wgiKQvE';

const supabase = createClient(URL, API_KEY);
export default supabase;