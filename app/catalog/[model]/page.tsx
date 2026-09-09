import { selectProduct } from '@/lib/product-selection';
import { iphoneCatalog } from '@/data/iphone-catalog';
import { additionalCatalog } from '@/data/additional-catalog';
import { AdditionalProductPage } from '@/components/catalog/supplemental-product-page';
import { IphoneProductPage } from '@/components/catalog/iphone-product-page';
import { samsungCatalog } from '@/data/samsung-catalog';
import { SamsungProductPage } from '@/components/catalog/samsung-product-page';
import { macbookCatalog } from '@/data/macbook-catalog';
import { MacbookProductPage } from '@/components/catalog/macbook-product-page';
import { ipadCatalog } from '@/data/ipad-catalog';
import { IpadProductPage } from '@/components/catalog/ipad-product-page';
import { audioCatalog } from '@/data/audio-catalog';
import { AudioProductPage } from '@/components/catalog/audio-product-page';
import { watchCatalog } from '@/data/watch-catalog';
import { WatchProductPage } from '@/components/catalog/watch-product-page';
import { playstationCatalog } from '@/data/playstation-catalog';
import { PlaystationProductPage } from '@/components/catalog/playstation-product-page';
import { googleCatalog } from '@/data/google-catalog';
import { GoogleProductPage } from '@/components/catalog/google-product-page';
import { dysonCatalog } from '@/data/dyson-catalog';
import { DysonProductPage } from '@/components/catalog/dyson-product-page';
import { cameraCatalog } from '@/data/camera-catalog';
import { CameraProductPage } from '@/components/catalog/camera-product-page';
import { xiaomiCatalog } from '@/data/xiaomi-catalog';
import { XiaomiProductPage } from '@/components/catalog/xiaomi-product-page';

export function generateStaticParams() {
  return [
    ...new Set([
      ...additionalCatalog.map((sku) => sku.modelSlug),
      ...iphoneCatalog.map((sku) => sku.modelSlug),
      ...samsungCatalog.map((sku) => sku.modelSlug),
      ...macbookCatalog.map((sku) => sku.modelSlug),
      ...ipadCatalog.map((sku) => sku.modelSlug),
      ...audioCatalog.map((sku) => sku.modelSlug),
      ...watchCatalog.map((sku) => sku.modelSlug),
      ...playstationCatalog.map((sku) => sku.modelSlug),
      ...googleCatalog.map((sku) => sku.modelSlug),
      ...dysonCatalog.map((sku) => sku.modelSlug),
      ...cameraCatalog.map((sku) => sku.modelSlug),
      ...xiaomiCatalog.map((sku) => sku.modelSlug),
    ]),
  ].map((model) => ({ model }));
}

export async function generateMetadata({ params }: { params: Promise<{ model: string }> }): Promise<Metadata> {
  const { model } = await params;
  const product = catalogItems.find(item => item.modelSlug === model);
  if (!product) notFound();
  return {
    title: `${product.model} — APPGRADE`,
    description: `${product.model}: выбор конфигурации, актуальная цена и оформление заказа в APPGRADE.`,
  };
}

export default async function ProductModelRoute({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ model: string }>;
  searchParams: Promise<{
    sku?: string;
    configuration?: string;
    connectivity?: string;
    storage?: string;
    color?: string;
    sim?: string;
    ram?: string;
    size?: string;
  }>;
}) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const legacy = additionalCatalog.find(item => item.legacySlug === params.model && item.legacySlug !== item.modelSlug);
  const candidates = catalogItems.filter(item => item.modelSlug === (legacy?.modelSlug ?? params.model));
  const target = selectProduct(candidates, legacy ? { ...searchParams, sku: searchParams.sku ?? legacy.id } : searchParams);
  if (!target) notFound();
  if (target.priceAlias) return <AdditionalProductPage selected={target} variants={candidates} />;
  const xiaomiVariants = xiaomiCatalog.filter(
    (sku) => sku.modelSlug === params.model,
  );
  if (xiaomiVariants.length) {
    const selectedXiaomi =
      xiaomiVariants.find(sku => sku.id === target.id)!;
    return (
      <XiaomiProductPage
        modelSlug={params.model}
        variants={xiaomiVariants}
        selected={selectedXiaomi}
      />
    );
  }
  const cameraVariants = cameraCatalog.filter(
    (sku) => sku.modelSlug === params.model,
  );
  if (cameraVariants.length) {
    const selectedCamera =
      cameraVariants.find(sku => sku.id === target.id)!;
    return (
      <CameraProductPage selected={selectedCamera} variants={cameraVariants} />
    );
  }
  const dysonVariants = dysonCatalog.filter(
    (sku) => sku.modelSlug === params.model,
  );
  if (dysonVariants.length) {
    const selectedDyson =
      dysonVariants.find(sku => sku.id === target.id)!;
    return (
      <DysonProductPage selected={selectedDyson} variants={dysonVariants} />
    );
  }
  const googleVariants = googleCatalog.filter(
    (sku) => sku.modelSlug === params.model,
  );
  if (googleVariants.length) {
    const selectedGoogle =
      googleVariants.find(sku => sku.id === target.id)!;
    return (
      <GoogleProductPage
        modelSlug={params.model}
        variants={googleVariants}
        selected={selectedGoogle}
      />
    );
  }
  const playstationVariants = playstationCatalog.filter(
    (sku) => sku.modelSlug === params.model,
  );
  if (playstationVariants.length) {
    const selectedPlaystation =
      playstationVariants.find(sku => sku.id === target.id)!;
    return (
      <PlaystationProductPage
        selected={selectedPlaystation}
        variants={playstationVariants}
      />
    );
  }
  const watchVariants = watchCatalog.filter(
    (sku) => sku.modelSlug === params.model,
  );
  if (watchVariants.length) {
    const selectedWatch =
      watchVariants.find(sku => sku.id === target.id)!;
    return (
      <WatchProductPage
        modelSlug={params.model}
        variants={watchVariants}
        selected={selectedWatch}
      />
    );
  }
  const audioVariants = audioCatalog.filter(
    (sku) => sku.modelSlug === params.model,
  );
  if (audioVariants.length) {
    const selectedAudio =
      audioVariants.find(sku => sku.id === target.id)!;
    return (
      <AudioProductPage
        model={selectedAudio.model}
        modelSlug={params.model}
        variants={audioVariants}
        selected={selectedAudio}
      />
    );
  }
  const ipadVariants = ipadCatalog.filter(
    (sku) => sku.modelSlug === params.model,
  );
  if (ipadVariants.length) {
    const selectedIpad =
      ipadVariants.find(sku => sku.id === target.id)!;
    return (
      <IpadProductPage
        model={selectedIpad.model}
        modelSlug={params.model}
        variants={ipadVariants}
        selected={selectedIpad}
      />
    );
  }
  const macbookVariants = macbookCatalog.filter(
    (sku) => sku.modelSlug === params.model,
  );
  if (macbookVariants.length) {
    const selectedMacbook =
      macbookVariants.find(sku => sku.id === target.id)!;
    return (
      <MacbookProductPage
        model={selectedMacbook.model}
        modelSlug={params.model}
        variants={macbookVariants}
        selected={selectedMacbook}
      />
    );
  }
  const samsungVariants = samsungCatalog.filter(
    (sku) => sku.modelSlug === params.model,
  );
  if (samsungVariants.length) {
    const selectedSamsung =
      samsungVariants.find(sku => sku.id === target.id)!;
    return (
      <SamsungProductPage
        model={selectedSamsung.model}
        modelSlug={params.model}
        variants={samsungVariants}
        selected={selectedSamsung}
      />
    );
  }
  const variants = iphoneCatalog.filter(
    (sku) => sku.modelSlug === params.model,
  );
  const model = variants[0]?.model ?? params.model.replaceAll('-', ' ');
  const selected =
    variants.find(sku => sku.id === target.id)!;
  if (!selected) notFound();
  return (
    <IphoneProductPage
      model={model}
      modelSlug={params.model}
      variants={variants}
      selected={selected}
    />
  );
}
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { catalogItems } from '@/lib/catalog-registry';
