/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { Reducer, useCallback, useEffect, useReducer } from 'react';

import { AdEventType } from '../AdEventType';
import { AppOpenAd } from '../ads/AppOpenAd';
import { InterstitialAd } from '../ads/InterstitialAd';
import { RewardedAd } from '../ads/RewardedAd';
import { RewardedAdEventType } from '../RewardedAdEventType';
import { AdStates, AdHookReturns } from '../types/AdStates';
import { AdShowOptions } from '../types/AdShowOptions';

const initialState: AdStates = {
  isLoaded: false,
  isOpened: false,
  isClicked: false,
  isClosed: false,
  error: undefined,
  reward: undefined,
  isEarnedReward: false,
};

export function useFullScreenAd<T extends InterstitialAd | RewardedAd | AppOpenAd | null>(
  ad: T,
): AdHookReturns {
  const [state, setState] = useReducer<Reducer<AdStates, Partial<AdStates>>>(
    (prevState, newState) => ({ ...prevState, ...newState }),
    initialState,
  );
  const isShowing = state.isOpened && !state.isClosed;

  const load = useCallback(() => {
    if (ad) {
      setState(initialState);
      ad.load();
    }
  }, [ad]);

  const show = useCallback(
    (showOptions?: AdShowOptions) => {
      if (ad) {
        ad.show(showOptions);
      }
    },
    [ad],
  );

  useEffect(() => {
    setState(initialState);
    if (!ad) {
      return;
    }
    const unsubscribe = ad.onAdEvent((type, error, data) => {
      switch (type) {
        case AdEventType.LOADED:
          setState({ isLoaded: true });
          break;
        case AdEventType.OPENED:
          setState({ isOpened: true });
          break;
        case AdEventType.CLOSED:
          setState({ isClosed: true });
          break;
        case AdEventType.CLICKED:
          setState({ isClicked: true });
          break;
        case AdEventType.ERROR:
          setState({ error: error });
          break;
        case RewardedAdEventType.LOADED:
          setState({ isLoaded: true, reward: data });
          break;
        case RewardedAdEventType.EARNED_REWARD:
          setState({ isEarnedReward: true, reward: data });
          break;
      }
    });
    return () => {
      unsubscribe();
    };
  }, [ad]);

  return {
    ...state,
    isShowing,
    load,
    show,
  };
}
