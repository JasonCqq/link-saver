# Embed Sites Configuration

## Missing a site?

If there a video platform or a general platform that supports embeds, please either:
-create a github issue
-email me through the email listed on github, or the email listed at the bottom of
linkstorage.net

## Purpose

This configuration file contains domain information for detecting embed capabilities of user-submitted URLs.

## Legal Disclaimer

⚠️ **IMPORTANT**: This is a technical reference for pattern matching only.

- No content is hosted, displayed, or linked by this application
- Domain inclusion does not constitute endorsement
- Users are responsible for complying with all applicable laws
- Age-restricted content must only be accessed by adults (18+)
- Domains listed based solely on technical embed capabilities

## Structure

```json
{
  "provider_name": "Streamable",
  "provider_url": "streamable.com",
  "query": "/",
  "link": "https://streamable.com/e/"
}
```

## Categories

### General Video Platforms

Safe for all ages, widely used platforms.

### Adult Content Platforms

**18+ ONLY** - These domains are included for technical completeness only.
Users must verify age and comply with local laws before accessing.

## Usage

This file is used by the application to:

1. Detect if a user-provided URL supports embedding
2. Determine which viewing method to use (iframe, parsed HTML, screenshot)
3. Show appropriate warnings for age-restricted content

## Maintenance

- Domains added based on embed capability testing
- Regular updates to reflect platform changes
- Community contributions welcome (see CONTRIBUTING.md)

## Questions?

Please head to linkstorage.net, and email at the bottom of the website.
