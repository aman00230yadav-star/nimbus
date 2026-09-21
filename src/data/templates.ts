import { TemplateDefinition } from '../types';

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'near_you',
    number: '01',
    title: 'NearYou',
    summary: 'Browser location demonstration',
    description: 'Demonstrates browser geolocation permission handling, coordinate precision, and user consent prompts.',
    demonstrates: 'Browser Geolocation API (Latitude, Longitude, Accuracy)',
    category: 'Location Awareness',
    simulatedViewType: 'near_you',
    recommendedScopes: ['device', 'network', 'location']
  },
  {
    id: 'device_info',
    number: '02',
    title: 'Device Info',
    summary: 'Browser/device information demonstration',
    description: 'Demonstrates what technical hardware and browser environment data a website can read upon visit.',
    demonstrates: 'Operating System, Platform, CPU Cores, Browser Version, Screen Resolution, GPU Renderer',
    category: 'Device Awareness',
    simulatedViewType: 'cloud_storage',
    recommendedScopes: ['device']
  },
  {
    id: 'network_info',
    number: '03',
    title: 'Network Info',
    summary: 'Public IP/network information demonstration',
    description: 'Demonstrates how public IP routing nodes reveal approximate regional location, ISP, and organization.',
    demonstrates: 'Public IP Address, Autonomous System / ISP, Region, Approximate City',
    category: 'Network Awareness',
    simulatedViewType: 'redirect',
    recommendedScopes: ['network']
  },
  {
    id: 'custom_link',
    number: '04',
    title: 'Custom Link',
    summary: 'Create a custom demonstration page',
    description: 'Create a customized demonstration scenario tailored to specific security awareness exercises.',
    demonstrates: 'Configurable demonstration with transparent multi-scope data collection',
    category: 'Custom Demonstration',
    simulatedViewType: 'custom_link',
    recommendedScopes: ['device', 'network', 'location']
  }
];

