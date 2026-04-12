import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";

const GOOGLE_MAPS_API_KEY = "AIzaSyCpMhqetQskMUsPFiHNNka6K1NsZutU8KM";

const MAP_ID = "DEMO_MAP_ID";

/* ── Global window extensions ── */
declare global {
  interface Window {
    google: any;
    __mapsApiLoaded?: boolean;
    __mapsApiCallbacks?: Array<() => void>;
  }
}

/* ── Public types ── */
export interface MapPickerResult {
  lat: number;
  lng: number;
  street?: string;
  area?: string;
  city?: string;
  emirate?: string;
}

interface Props {
  onSelect: (result: MapPickerResult) => void;
  defaultLat?: number;
  defaultLng?: number;
}

/* ── Improved Maps loader ── */
function loadMapsBootstrap(onReady: () => void) {

  if (window.google?.maps?.importLibrary) {
    onReady();
    return;
  }

  if (!window.__mapsApiCallbacks) {
    window.__mapsApiCallbacks = [];
  }

  window.__mapsApiCallbacks.push(onReady);

  if (document.getElementById("google-maps-script")) return;

  const script = document.createElement("script");

  script.id = "google-maps-script";

  script.src =
    `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}` +
    `&loading=async&libraries=places,marker,geocoding`;

  script.async = true;
  script.defer = true;

  script.onload = () => {
    window.__mapsApiLoaded = true;

    window.__mapsApiCallbacks?.forEach((cb) => cb());

    window.__mapsApiCallbacks = [];
  };

  document.head.appendChild(script);
}

/* ── Parse Geocoder address components ── */
function parseGeocoderComponents(components: any[]): Partial<MapPickerResult> {

  const get = (type: string) =>
    (components || []).find((c: any) => c.types?.includes(type))?.long_name ?? "";

  return {
    street: [get("street_number"), get("route")].filter(Boolean).join(" ") || undefined,

    area:
      get("sublocality_level_1") ||
      get("sublocality") ||
      get("neighborhood") ||
      get("administrative_area_level_2") ||
      undefined,

    city: get("locality") || get("postal_town") || undefined,

    emirate: get("administrative_area_level_1") || undefined,
  };
}

/* ── Parse Places API components ── */
function parsePlaceComponents(components: any[]): Partial<MapPickerResult> {

  const get = (type: string) =>
    (components || []).find((c: any) => c.types?.includes(type))?.longText ?? "";

  return {
    street: [get("street_number"), get("route")].filter(Boolean).join(" ") || undefined,

    area:
      get("sublocality_level_1") ||
      get("sublocality") ||
      get("neighborhood") ||
      get("administrative_area_level_2") ||
      undefined,

    city: get("locality") || get("postal_town") || undefined,

    emirate: get("administrative_area_level_1") || undefined,
  };
}

export default function GoogleMapPicker({
  onSelect,
  defaultLat = 25.2048,
  defaultLng = 55.2708,
}: Props) {

  const mapDivRef = useRef<HTMLDivElement>(null);
  const acContainerRef = useRef<HTMLDivElement>(null);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const initializedRef = useRef(false);

  const [isLoaded, setIsLoaded] = useState(false);
  const [locating, setLocating] = useState(false);
  const [address, setAddress] = useState("");

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {

      if (!geocoderRef.current) return;

      try {

        const { results } =
          await geocoderRef.current.geocode({
            location: { lat, lng },
          });

        if (results?.[0]) {

          setAddress(results[0].formatted_address ?? "");

          onSelect({
            lat,
            lng,
            ...parseGeocoderComponents(
              results[0].address_components ?? []
            ),
          });

        } else {

          onSelect({ lat, lng });

        }

      } catch {

        onSelect({ lat, lng });

      }
    },
    [onSelect]
  );

  const initMap = useCallback(async () => {

    if (
      initializedRef.current ||
      mapRef.current ||
      !mapDivRef.current ||
      !window.google?.maps?.importLibrary
    ) {
      return;
    }

    initializedRef.current = true;

    try {

      const [
        { Map },
        { AdvancedMarkerElement },
        { Geocoder },
        { PlaceAutocompleteElement },
      ] = await Promise.all([
        window.google.maps.importLibrary("maps"),
        window.google.maps.importLibrary("marker"),
        window.google.maps.importLibrary("geocoding"),
        window.google.maps.importLibrary("places"),
      ]);

      const center = { lat: defaultLat, lng: defaultLng };

      const map = new Map(mapDivRef.current!, {
        center,
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
        mapId: MAP_ID,
      });

      const marker = new AdvancedMarkerElement({
        position: center,
        map,
        gmpDraggable: true,
      });

      mapRef.current = map;
      markerRef.current = marker;

      geocoderRef.current = new Geocoder();

      marker.addEventListener("dragend", () => {

        const pos = marker.position;

        if (!pos) return;

        const lat =
          typeof pos.lat === "function"
            ? pos.lat()
            : pos.lat;

        const lng =
          typeof pos.lng === "function"
            ? pos.lng()
            : pos.lng;

        reverseGeocode(lat, lng);
      });

      map.addListener("click", (e: any) => {

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        marker.position = { lat, lng };

        reverseGeocode(lat, lng);
      });

      if (acContainerRef.current) {

        const placeAC = new PlaceAutocompleteElement({
          componentRestrictions: {
            country: ["ae", "in", "cn"],
          },
        });

        acContainerRef.current.innerHTML = "";

        acContainerRef.current.appendChild(placeAC);

        placeAC.addEventListener(
          "gmp-placeselect",
          async (e: any) => {

            try {

              const { place } = e;

              await place.fetchFields({
                fields: [
                  "location",
                  "addressComponents",
                  "formattedAddress",
                ],
              });

              const lat = place.location?.lat();
              const lng = place.location?.lng();

              if (lat == null || lng == null) return;

              marker.position = { lat, lng };

              map.panTo({ lat, lng });

              setAddress(place.formattedAddress ?? "");

              onSelect({
                lat,
                lng,
                ...parsePlaceComponents(
                  place.addressComponents ?? []
                ),
              });

            } catch {}
          }
        );
      }

      setIsLoaded(true);

    } catch (err) {

      console.error("GoogleMapPicker init error:", err);

      initializedRef.current = false;

    }

  }, [defaultLat, defaultLng, reverseGeocode, onSelect]);

  useEffect(() => {
    loadMapsBootstrap(initMap);
  }, [initMap]);

  const handleUseLocation = () => {

    if (!navigator.geolocation) return;

    setLocating(true);

    navigator.geolocation.getCurrentPosition(

      ({ coords: { latitude: lat, longitude: lng } }) => {

        if (markerRef.current)
          markerRef.current.position = { lat, lng };

        if (mapRef.current)
          mapRef.current.panTo({ lat, lng });

        reverseGeocode(lat, lng);

        setLocating(false);
      },

      () => setLocating(false),

      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className="space-y-2">

      <div className="flex gap-2 items-center">

        <div className="flex-1 min-w-0">

          {!isLoaded && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl opacity-50">
              <MapPin size={14} className="text-slate-400 shrink-0" />
              <span className="text-sm text-slate-400">
                Loading search…
              </span>
            </div>
          )}

          <div
            ref={acContainerRef}
            className={!isLoaded ? "hidden" : "w-full"}
          />

        </div>

        <button
          type="button"
          onClick={handleUseLocation}
          disabled={locating || !isLoaded}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {locating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Navigation size={14} />
          )}
          My Location
        </button>

      </div>

      <div
        className="relative rounded-xl overflow-hidden border border-slate-200"
        style={{ height: 220 }}
      >

        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        )}

        <div
          ref={mapDivRef}
          className="w-full h-full"
        />

      </div>

      {address && (
        <p className="text-[11px] text-slate-500 flex items-start gap-1 px-1 leading-tight">
          <MapPin
            size={11}
            className="text-cyan-500 shrink-0 mt-0.5"
          />
          {address}
        </p>
      )}

    </div>
  );
}