import { productMetadata, productStructuredData } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { modelVariants, selectProduct, variantFields } from '@/lib/product-selection';
import { iphoneCatalog } from '@/data/iphone-catalog';
import { AdditionalProductPage } from '@/components/catalog/supplemental-product-page';
import { getProductDetails } from '@/lib/product-details';
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
import { ProductRecommendations } from '@/components/catalog/product-recommendations';
import { productRecommendations } from '@/lib/product-recommendations';
import { catalogProductCard } from '@/data/popular-products';

export async function generateMetadata({ params, searchParams }: ProductRouteProps): Promise<Metadata> {
  const { target } = await resolveProduct({ params, searchParams });
  return productMetadata(target, getProductDetails(target));
}

type ProductRouteProps = { params: Promise<{ model: string }>; searchParams: Promise<Selection> };
async function resolveProduct({ params, searchParams }: ProductRouteProps) {
  const { model } = await params;
  const query = await searchParams;
  if (['sku', ...variantFields].some(key => {
    const value = query[key as keyof Selection];
    return value !== undefined && typeof value !== 'string';
  })) notFound();
  const { legacy, variants } = modelVariants(catalogItems, model);
  const target = selectProduct(variants, legacy ? { ...query, sku: query.sku ?? legacy.id } : query);
  if (!target) notFound();
  if (legacy) permanentRedirect(productHref(target));
  return { target };
}
export default async function ProductRoute(props: ProductRouteProps) {
  const { target } = await resolveProduct(props);
  return <><JsonLd data={productStructuredData(target, getProductDetails(target))} /><ProductModelRoute {...props} /><ProductRecommendations products={productRecommendations(target).map(catalogProductCard)} /></>;
}

async function ProductModelRoute({
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
    chip?: string;
    size?: string;
  }>;
}) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const { legacy, variants: candidates } = modelVariants(catalogItems, params.model);
  const target = selectProduct(candidates, legacy ? { ...searchParams, sku: searchParams.sku ?? legacy.id } : searchParams);
  if (!target) notFound();
  if (target.priceAlias || parserUnavailableIds.has(target.id)) return <AdditionalProductPage key={target.id} selected={target} details={getProductDetails(target)} />;
  const xiaomiVariants = withCatalogMedia(xiaomiCatalog.filter(
    (sku) => sku.modelSlug === params.model && activeIds.has(sku.id),
  ));
  if (xiaomiVariants.length) {
    const selectedXiaomi =
      xiaomiVariants.find(sku => sku.id === target.id)!;
    return (
      <XiaomiProductPage specifications={getProductDetails(target)} key={target.id}
        modelSlug={params.model}
        variants={xiaomiVariants}
        selected={selectedXiaomi}
      />
    );
  }
  const cameraVariants = withCatalogMedia(cameraCatalog.filter(
    (sku) => sku.modelSlug === params.model && activeIds.has(sku.id),
  ));
  if (cameraVariants.length) {
    const selectedCamera =
      cameraVariants.find(sku => sku.id === target.id)!;
    return (
      <CameraProductPage specifications={getProductDetails(target)} key={target.id} selected={selectedCamera} variants={cameraVariants} />
    );
  }
  const dysonVariants = withCatalogMedia(dysonCatalog.filter(
    (sku) => sku.modelSlug === params.model && activeIds.has(sku.id),
  ));
  if (dysonVariants.length) {
    const selectedDyson =
      dysonVariants.find(sku => sku.id === target.id)!;
    return (
      <DysonProductPage specifications={getProductDetails(target)} key={target.id} selected={selectedDyson} variants={dysonVariants} />
    );
  }
  const googleVariants = withCatalogMedia(googleCatalog.filter(
    (sku) => sku.modelSlug === params.model && activeIds.has(sku.id),
  ));
  if (googleVariants.length) {
    const selectedGoogle =
      googleVariants.find(sku => sku.id === target.id)!;
    return (
      <GoogleProductPage specifications={getProductDetails(target)} key={target.id}
        modelSlug={params.model}
        variants={googleVariants}
        selected={selectedGoogle}
      />
    );
  }
  const playstationVariants = withCatalogMedia(playstationCatalog.filter(
    (sku) => sku.modelSlug === params.model && activeIds.has(sku.id),
  ));
  if (playstationVariants.length) {
    const selectedPlaystation =
      playstationVariants.find(sku => sku.id === target.id)!;
    return (
      <PlaystationProductPage specifications={getProductDetails(target)} key={target.id}
        selected={selectedPlaystation}
        variants={playstationVariants}
      />
    );
  }
  const watchVariants = withCatalogMedia(watchCatalog.filter(
    (sku) => sku.modelSlug === params.model && activeIds.has(sku.id),
  ));
  if (watchVariants.length) {
    const selectedWatch =
      watchVariants.find(sku => sku.id === target.id)!;
    return (
      <WatchProductPage specifications={getProductDetails(target)} key={target.id}
        modelSlug={params.model}
        variants={watchVariants}
        selected={selectedWatch}
      />
    );
  }
  const audioVariants = withCatalogMedia(audioCatalog.filter(
    (sku) => sku.modelSlug === params.model && activeIds.has(sku.id),
  ));
  if (audioVariants.length) {
    const selectedAudio =
      audioVariants.find(sku => sku.id === target.id)!;
    return (
      <AudioProductPage specifications={getProductDetails(target)} key={target.id}
        model={selectedAudio.model}
        modelSlug={params.model}
        variants={audioVariants}
        selected={selectedAudio}
      />
    );
  }
  const ipadVariants = withCatalogMedia(ipadCatalog.filter(
    (sku) => sku.modelSlug === params.model && activeIds.has(sku.id),
  ));
  if (ipadVariants.length) {
    const selectedIpad =
      ipadVariants.find(sku => sku.id === target.id)!;
    return (
      <IpadProductPage specifications={getProductDetails(target)} key={target.id}
        model={selectedIpad.model}
        modelSlug={params.model}
        variants={ipadVariants}
        selected={selectedIpad}
      />
    );
  }
  const macbookVariants = withCatalogMedia(macbookCatalog.filter(
    (sku) => sku.modelSlug === params.model && activeIds.has(sku.id),
  ));
  if (macbookVariants.length) {
    const selectedMacbook =
      macbookVariants.find(sku => sku.id === target.id)!;
    return (
      <MacbookProductPage specifications={getProductDetails(target)} key={target.id}
        model={selectedMacbook.model}
        modelSlug={params.model}
        variants={macbookVariants}
        selected={selectedMacbook}
      />
    );
  }
  const samsungVariants = withCatalogMedia(samsungCatalog.filter(
    (sku) => sku.modelSlug === params.model && activeIds.has(sku.id),
  ));
  if (samsungVariants.length) {
    const selectedSamsung =
      samsungVariants.find(sku => sku.id === target.id)!;
    return (
      <SamsungProductPage specifications={getProductDetails(target)} key={target.id}
        model={selectedSamsung.model}
        modelSlug={params.model}
        variants={samsungVariants}
        selected={selectedSamsung}
      />
    );
  }
  const variants = withCatalogMedia(iphoneCatalog.filter(
    (sku) => sku.modelSlug === params.model && activeIds.has(sku.id),
  ));
  const model = variants[0]?.model ?? params.model.replaceAll('-', ' ');
  const selected =
    variants.find(sku => sku.id === target.id)!;
  if (!selected) notFound();
  return (
    <IphoneProductPage specifications={getProductDetails(target)} key={target.id}
      model={model}
      modelSlug={params.model}
      variants={variants}
      selected={selected}
    />
  );
}
import { notFound, permanentRedirect } from 'next/navigation';
import { productHref, type Selection } from '@/lib/product-selection';
import type { Metadata } from 'next';
import { catalogById, catalogItems, parserUnavailableIds } from '@/lib/catalog-registry';

const activeIds = new Set(catalogItems.map((item) => item.id));

function withCatalogMedia<T extends { id: string; image: string; gallery?: string[] }>(items: T[]): T[] {
  return items.map(item => {
    const catalog = catalogById.get(item.id)!;
    return { ...item, image: catalog.image, gallery: catalog.gallery };
  });
}
