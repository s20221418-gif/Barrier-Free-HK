# HK Accessible Map - Project TODO

## Database Schema & Data Integration
- [x] Design database schema for accessibility data (lifts, footbridges, zebra crossings, pedestrian network)
- [x] Create tables for user profiles and saved locations
- [x] Download HK government datasets (3D Pedestrian Network, EMSD lifts, zebra crossings, footbridges)
- [x] Process and import accessibility data into database
- [x] Create database indexes for efficient route queries

## UI Design System & Accessibility
- [x] Design high-contrast color palette optimized for elderly users
- [x] Implement large font system with adjustable text sizes
- [x] Create accessible button components with large touch targets
- [x] Design simplified navigation interface
- [x] Implement voice navigation support
- [ ] Add screen reader compatibility

## Map Interface
- [x] Integrate Google Maps with proxy authentication
- [x] Display accessible facilities on map (lifts, ramps, footbridges)
- [x] Show zebra crossings with extended crossing time indicators
- [x] Implement current location tracking
- [x] Add map controls optimized for elderly users
- [x] Display facility information cards on map markers

## Barrier-Free Routing
- [x] Implement routing algorithm that prioritizes accessible paths
- [x] Avoid stairs and inaccessible routes
- [x] Prioritize routes with lifts, ramps, and level crossings
- [x] Calculate routes using 3D pedestrian network data
- [x] Show alternative accessible routes
- [x] Display estimated travel time and distance

## Navigation Features
- [x] Build turn-by-turn navigation interface
- [x] Implement audio navigation cues
- [x] Show upcoming accessibility features on route
- [x] Add compass navigation system
- [x] Real-time location tracking during navigation
- [x] Alert users about lift availability and footbridge access

## Search & Location Features
- [x] Implement location search with autocomplete
- [x] Search for accessible routes between two points
- [x] Find nearby accessible facilities
- [x] MTR station accessibility information
- [x] Popular destination quick access

## User Profile System
- [x] User authentication and profile management
- [x] Save favorite locations
- [x] Store frequently used routes
- [x] Accessibility preferences (font size, contrast, voice)
- [x] Route history

## Testing & Quality Assurance
- [x] Test with elderly users for usability
- [x] Verify routing accuracy with real accessibility data
- [x] Test voice navigation on mobile devices
- [x] Cross-browser compatibility testing
- [x] Mobile responsiveness testing
- [x] Write unit tests for routing algorithm

## New Feature Requests
- [x] Add public transport mode selection (MTR, bus, walking)
- [x] Integrate accessible MTR station information into routing
- [x] Include accessible bus routes in navigation
- [x] Allow users to re-adjust origin location after initial input
- [x] Allow users to re-adjust destination location after initial input
- [x] Add swap button to quickly reverse origin and destination
- [x] Show combined walking + transit directions
- [x] Display accessibility information for transit stops

## Speech Recognition Features
- [x] Add microphone button for origin input field
- [x] Add microphone button for destination input field
- [x] Implement Web Speech API for voice recognition
- [x] Show visual feedback during speech recording
- [x] Handle speech recognition errors gracefully
- [x] Support both English and Cantonese speech input
- [x] Provide audio confirmation of recognized text

## New Enhancement Requests
- [x] Implement draggable markers for origin and destination on map
- [x] Allow users to fine-tune locations by dragging map icons
- [x] Save route history (from/to locations) in localStorage
- [x] Display recent route history for quick selection
- [x] Add language toggle button (EN/中) next to microphone buttons
- [x] Switch speech recognition language based on toggle
- [x] Create quick location shortcuts panel
- [x] Add buttons for hospitals, government offices, major MTR stations
- [x] Research and extract data from AccessGuide.hk
- [x] Integrate AccessGuide.hk accessible locations on map
- [x] Display AccessGuide.hk location icons with proper categories
- [x] Make AccessGuide.hk locations clickable for route planning

## Advanced Features - Phase 3
- [x] Extend database schema for lift status tracking
- [x] Add table for user-contributed accessibility notes
- [x] Add table for photo uploads linked to notes
- [x] Create lift status monitoring system
- [x] Display red warning badges on out-of-service lifts
- [x] Integrate EMSD lift maintenance data
- [x] Update route algorithm to avoid broken lifts
- [x] Build turn-by-turn navigation panel UI
- [x] Display step-by-step instructions with icons
- [x] Show estimated time per navigation segment
- [x] Add lift/ramp/stairs icons to each step
- [x] Implement "Next Step" audio button
- [x] Auto-advance steps during active navigation
- [x] Create user notes submission form
- [x] Allow photo upload with notes
- [x] Display user notes on facility markers
- [x] Add rating system for accessibility conditions
- [x] Implement note moderation for authenticated users
- [x] Show photo gallery for each location
