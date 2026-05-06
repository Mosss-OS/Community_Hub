# Admin Privileges in Community Hub

## Current Admin Privileges

### 1. Super Admin (isSuperAdmin = true)
- Full system access
- Create/delete organizations
- Manage all users across organizations
 - Access super admin dashboard (`/super-admin`)
- System-wide settings

### 2. Admin (isAdmin = true)
- Manage church organization:
  - Create/edit events (`/admin/events`)
  - Manage live streams (`/admin/live-stream/new`)
  - View analytics (`/admin/analytics`)
  - Backup management (`/admin/backups`)
  - User management (approve/reject/block users)
  - Manage giving campaigns (`/admin/campaigns`)
  - Webhook management (`/admin/webhooks`)
  - Integration settings (`/admin/integrations`)
  - Campus management (`/admin/campuses`)
  - Custom pages (`/admin/custom-pages`)
  - Email templates (`/admin/email-templates`)

### 3. Pastor/Ministry Leader Roles
- `PASTOR`, `PASTORS_WIFE` - Ministry oversight
- `CELL_LEADER` - Cell group management
- `USHER_LEADER`, `USHER` - Attendance & ushering
- `PRAYER_TEAM` - Prayer request management
- `FINANCE_TEAM` - Donation tracking
- `WORSHIP_TEAM` - Service management

## Automatic Attendance Tracking

### When Attendance is Recorded:
1. **User logs in** → `lastLoginAt` updated automatically
2. **User joins live stream** → `POST /api/live-streams/:id/attendance`
3. **Manual check-in** → `/attendance/checkin` page
4. **QR code scan** → `/attendance/scan` page

### Database Fields Added:
- `users.lastLoginAt` - Updated on successful login
- `users.lastActive` - Updated on activity
- `attendance.attendanceType` - 'APP_LOGIN', 'LIVE_STREAM', 'MANUAL', 'QR_SCAN'

## New Pages Added for Optimal Use

1. **PrayerRequestsPage** (`/prayer-requests`)
   - Create/view personal prayer requests
   - Answer prayers (admin)
   - Prayer count tracking

2. **DonationHistoryPage** (`/donations`)
   - View giving history by year
   - Total calculations
   - Export functionality

3. **BibleStudyPage** (`/bible-studies`)
   - View/join Bible study groups
   - Group details (leader, time, location)
   - Member count

4. **Enhanced EventDetailPage** (`/events/:id`)
   - RSVP functionality
   - Calendar export
   - Social sharing

5. **ProfilePage** (`/profile`)
   - Update personal info (firstName, lastName, bio)
   - Backend: `PUT /api/user/profile`
