import { permanentRedirect } from 'next/navigation';

export default function RemovedGadgetsRoute() {
  permanentRedirect('/catalog');
}
