# Ideas

- Gardens that contain a collection of beds
- ability to share beds with other members - create a "team"? (or some other clever name)

## Roadmap

### Mobile App (Expo / React Native)
Native iOS + Android app on the App Store. The web API layer is already in place (`/api/`), so the mobile app would be a new frontend calling the same endpoints. Key considerations:
- Auth0 supports native PKCE flows via `auth0-react-native`
- Garden planner grid would benefit from native touch/gesture handling
- Push notifications for watering reminders, seasonal planting alerts
- Camera integration for journal photos (already supported in web)
- Approach: Expo managed workflow, shared TypeScript types from this repo
